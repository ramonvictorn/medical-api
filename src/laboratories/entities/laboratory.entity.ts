import { LaboratoriesExams } from '../../exams/entities/laboratories_exams.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LaboratoryStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Entity({ name: 'laboratories' })
export class Laboratory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  status: LaboratoryStatus = LaboratoryStatus.Active;

  @OneToMany(
    () => LaboratoriesExams,
    (laboratoriesExams) => laboratoriesExams.laboratory,
  )
  exams: LaboratoriesExams[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt?: Date;
}
