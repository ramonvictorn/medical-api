import { LaboratoriesExams } from 'src/exams/entities/laboratories_exams.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
}
