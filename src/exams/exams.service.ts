import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Laboratory,
  LaboratoryStatus,
} from '../laboratories/entities/laboratory.entity';
import { EntityNotFoundError, In, Repository } from 'typeorm';
import { CreateExamDto, CreateMultipleExamDto } from './dto/create-exam.dto';
import { RemoveMultiplesExamsDto } from './dto/delete-multples-exams.dto';
import { SearchExamDto } from './dto/search-exam.dto';
import { UpdateExamDto, UpdateMultipleExamsDto } from './dto/update-exam.dto';
import { Exam, ExamStatus } from './entities/exam.entity';
import { LaboratoriesExams } from './entities/laboratories_exams.entity';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Laboratory)
    private laboratoryRepository: Repository<Laboratory>,
    @InjectRepository(LaboratoriesExams)
    private laboratoriesExamsRepository: Repository<LaboratoriesExams>,
  ) {}

  private async createExams(createExamDto: CreateExamDto | CreateExamDto[]) {
    const examsToCreat: CreateExamDto[] = Array.isArray(createExamDto)
      ? createExamDto
      : [createExamDto];

    const laboratoriesInfo = {};
    const message = [];

    const examsPromised = examsToCreat.map(async (examDto) => {
      const exam = this.examRepository.create(examDto);
      await this.examRepository.save(exam);

      if (!examDto.laboratories || examDto.laboratories.length <= 0) {
        return this.getExamsWithLaboratoriesInfo({
          examId: exam.id,
        });
      }
      const connectExamsPromised = examDto.laboratories.map(async (lab) => {
        const labId = lab.laboratory_id;
        let labInfo = laboratoriesInfo[labId];

        if (!labInfo || !labInfo.id) {
          laboratoriesInfo[labId] = await this.laboratoryRepository.findOne({
            where: {
              id: labId,
            },
          });
          labInfo = laboratoriesInfo[labId];
        }

        if (labInfo && labInfo.status === LaboratoryStatus.Active) {
          await this.addExamToLaboratory(labId, exam.id);
        } else {
          message.push(
            `Laboratory ${labId} cannot be used, check the laboratory status`,
          );
        }
      });

      await Promise.all(connectExamsPromised);
      return this.getExamsWithLaboratoriesInfo({
        examId: exam.id,
      });
    });

    const examsResults = await Promise.all(examsPromised);

    if (message.length) {
      return {
        message,
        exams: examsResults,
      };
    }

    return {
      exams: examsResults,
    };
  }

  async create(createExamDto: CreateExamDto) {
    return this.createExams(createExamDto);
  }

  async createMultiple(createMultipleExamDto: CreateMultipleExamDto) {
    return this.createExams(createMultipleExamDto.exams);
  }

  async findAll(query: SearchExamDto) {
    return this.getExamsWithLaboratoriesInfo(query);
  }

  async findOne(id: string) {
    const examFound = await this.getExamsWithLaboratoriesInfo({
      examId: id,
    });

    if (!examFound) {
      throw new EntityNotFoundError(Exam, id);
    }

    return examFound;
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    if (Object.keys(updateExamDto).length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          error: 'PROVIDE_AT_LEAT_ONE_FIELD_TO_UPDATE',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
    const { laboratories, ...updateExamDetails } = updateExamDto;
    const updateResult = await this.examRepository.update(
      id,
      updateExamDetails,
    );

    if (!updateResult.affected) {
      throw new EntityNotFoundError(Exam, id);
    }

    if (laboratories) {
      const currentLaboratories = await this.laboratoriesExamsRepository.find({
        where: {
          exam_id: id,
        },
        relations: ['laboratory'],
      });

      const laboratoriesIdToDisconnect = {};
      currentLaboratories.forEach((lab) => {
        laboratoriesIdToDisconnect[lab.laboratory_id] = lab;
      });

      await Promise.all(
        laboratories.map(async ({ laboratory_id }) => {
          const existentLab = currentLaboratories.find(
            (existentLabConnection) => {
              return existentLabConnection.laboratory_id === laboratory_id;
            },
          );

          if (existentLab) {
            delete laboratoriesIdToDisconnect[laboratory_id];
          } else {
            const laboratoryInfo = await this.laboratoryRepository.findOne({
              where: { id: laboratory_id },
            });

            if (laboratoryInfo.status === LaboratoryStatus.Active) {
              const laboratoryExam = this.laboratoriesExamsRepository.create({
                exam_id: id,
                laboratory_id,
              });
              await this.laboratoriesExamsRepository.save(laboratoryExam);
            }
          }
        }),
      );

      const labIdsToDelete = Object.keys(laboratoriesIdToDisconnect).map(
        (labId) => labId,
      );
      if (labIdsToDelete.length) {
        await this.laboratoriesExamsRepository.delete({
          exam_id: id,
          laboratory_id: In(labIdsToDelete),
        });
      }
    }
    return this.examRepository.findOne(id);
  }

  async updateMultiples(updateMultiplesExamsDto: UpdateMultipleExamsDto) {
    return Promise.all(
      updateMultiplesExamsDto.exams.map((examInfo) => {
        const { id, ...dtoDetails } = examInfo;
        return this.update(id, dtoDetails);
      }),
    );
  }

  async remove(id: string) {
    const existentExan = await this.examRepository.findOne(id);
    if (!existentExan) {
      throw new EntityNotFoundError(Exam, id);
    }

    const deleteResult = await this.examRepository.softDelete(id);

    if (!deleteResult.affected) {
      throw new EntityNotFoundError(Exam, id);
    }
  }

  async removeMultiples(removeMultiplesExamsDto: RemoveMultiplesExamsDto) {
    const message = [];

    await Promise.all(
      removeMultiplesExamsDto.exams.map(async (examInfo) => {
        try {
          await this.remove(examInfo.id);
          return;
        } catch (error) {
          console.log(error);
          message.push(error);
        }
      }),
    );

    if (message.length) {
      return {
        message,
      };
    }
  }

  async toggleExamOnLaboratory(examId: string, laboratoryId: string) {
    const [exam, laboratory] = await Promise.all([
      this.examRepository.findOne({ where: { id: examId } }),
      this.laboratoryRepository.findOne({ where: { id: laboratoryId } }),
    ]);

    if (!exam || exam.status !== ExamStatus.Active) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          error: 'EXAM_NOT_ACTIVE',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (!laboratory || laboratory.status !== LaboratoryStatus.Active) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          error: 'LABORATORY_NOT_ACTIVE',
        },
        HttpStatus.CONFLICT,
      );
    }

    const whereCondition = {
      exam_id: examId,
      laboratory_id: laboratoryId,
    };
    const exitentLaboratoryExam =
      await this.laboratoriesExamsRepository.findOne({
        where: whereCondition,
      });

    if (exitentLaboratoryExam) {
      await this.laboratoriesExamsRepository.delete(whereCondition);
      return { action: 'deleted' };
    } else {
      const laboratoryExam =
        this.laboratoriesExamsRepository.create(whereCondition);
      await this.laboratoriesExamsRepository.save(laboratoryExam);
      return { action: 'created' };
    }
  }

  private async getExamsWithLaboratoriesInfo(filters: SearchExamDto) {
    const queryBuilder = this.examRepository.manager.createQueryBuilder();

    const query = queryBuilder
      .select(
        `
          exams.id
        , exams."name" 
        , exams.status 
        , exams."type" 
        , coalesce(json_agg(laboratories) filter (where laboratories.id is not null), '[]'::json) "laboratories"
        `,
      )
      .from(Exam, 'exams')
      .leftJoin(
        LaboratoriesExams,
        'laboratories_exams',
        'laboratories_exams.exam_id = exams.id',
      )
      .leftJoin(
        Laboratory,
        'laboratories',
        'laboratories.id = laboratories_exams.laboratory_id',
      )
      .groupBy('exams.id');

    if (filters.status) {
      query.where('exams.status = :examStatus', { examStatus: filters.status });
    }

    if (filters.examId) {
      query.where('exams.id = :examId', { examId: filters.examId });
    }

    if (filters.q) {
      query.andWhere('exams.name ilike :queryParam', {
        queryParam: `%${filters.q}%`,
      });
    }

    const exams = await query.getRawMany();
    if (filters.examId) {
      return exams.length ? exams[0] : null;
    }
    return exams;
  }

  private async addExamToLaboratory(laboratoryId: string, examId: string) {
    const queryBuilder = this.examRepository.manager.createQueryBuilder();
    return queryBuilder
      .insert()
      .into(LaboratoriesExams)
      .values([
        {
          exam_id: examId,
          laboratory_id: laboratoryId,
        },
      ])
      .execute();
  }
}
