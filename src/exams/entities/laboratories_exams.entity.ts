import { Laboratory } from '../../laboratories/entities/laboratory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exam } from './exam.entity';

@Entity({ name: 'laboratories_exams' })
export class LaboratoriesExams {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  laboratory_id: string;

  @ManyToOne(() => Laboratory, (laboratory) => laboratory.exams)
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;

  @Column()
  exam_id: string;

  @ManyToOne(() => Exam, (exam) => exam.laboratories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exame: Exam;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
