import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlbumBoard } from './album-board.entity';
import { WorkSchedule } from './work-schedule.entity';

@Entity({ name: 'work_schedule_files' })
export class WorkScheduleFiles {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  workScheduleId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column({ comment: '파일 저장 위치' })
  path!: string;

  @Column({ comment: '변환된 파일 이름' })
  filename!: string;

  @Column({ comment: '파일 크기' })
  size!: number;

  @Column({ comment: '원본파일 이름' })
  originalname!: string;

  @Column({ comment: '파일 타입' })
  mimetype!: string;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(
    (type) => WorkSchedule,
    (workSchedule) => workSchedule.workScheduleFile,
  )
  workSchedule: WorkSchedule;
}
