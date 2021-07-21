import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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
  laboratories: LaboratoriesExams[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt?: Date;
}
