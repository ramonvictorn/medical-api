import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { SearchLaboratoryDto } from './dto/search-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';
import { Laboratory } from './entities/laboratory.entity';
import { validate as uuidValidate } from 'uuid'

@Injectable()
export class LaboratoriesService {
  constructor(
    @InjectRepository(Laboratory)
    private laboratoryRepository: Repository<Laboratory>,
  ) {}

  create(createLaboratoryDto: CreateLaboratoryDto) {
    const laboratory = this.laboratoryRepository.create(createLaboratoryDto);
    return this.laboratoryRepository.save(laboratory);
  }

  findAll(query: SearchLaboratoryDto) {
    const where = query;
    return this.laboratoryRepository.find({ where });
  }

  async findOne(id: string) {
    const laboratory = await this.laboratoryRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!laboratory) {
      throw new EntityNotFoundError(Laboratory, id);
    }
    return laboratory;
  }

  async update(id: string, updateLaboratoryDto: UpdateLaboratoryDto) {
    // to do valid uuid
    if (+(Object.keys(updateLaboratoryDto)) === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          error: 'PROVIDE_AT_LEAT_ONE_FIELD_TO_UPDATE',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
    const updateResult = await this.laboratoryRepository.update(
      id,
      updateLaboratoryDto,
    );
    if (!updateResult.affected) {
      throw new EntityNotFoundError(Laboratory, id);
    }
    return this.laboratoryRepository.findOne(id);
  }

  async remove(id: string) {
    const deleteResult = await this.laboratoryRepository.delete(id);
    if (!deleteResult.affected) {
      throw new EntityNotFoundError(Laboratory, id);
    }
  }
}
