import { Laboratory } from 'src/laboratories/entities/laboratory.entity';
import {
  Column,
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

  @ManyToOne(() => Laboratory, (laboratory) => laboratory.id)
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: Laboratory;

  @Column()
  exam_id: string;

  @ManyToOne(() => Exam, (exam) => exam.id)
  @JoinColumn({ name: 'exam_id' })
  exame: Exam;
}
