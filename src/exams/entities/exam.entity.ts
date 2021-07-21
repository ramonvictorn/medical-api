import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LaboratoriesExams } from './laboratories_exams.entity';

export enum ExamStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum ExamType {
  Analysis = 'analysis',
  Clinic = 'clinic',
  Image = 'image',
}

@Entity({ name: 'exams' })
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: ExamType;

  @Column()
  status: ExamStatus = ExamStatus.Active;

  @OneToMany(
    () => LaboratoriesExams,
    (laboratoriesExams) => laboratoriesExams.exame,
  )
  laboratories: Promise<LaboratoriesExams[]>;
}
