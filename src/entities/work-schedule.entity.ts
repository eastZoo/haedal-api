import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Files } from './files.entity';
import { AlbumBoardComment } from './album-board-comment.entity';
import { WorkScheduleFiles } from './work-schedule-files.entity';

@Entity({ name: 'work_schedule' })
export class WorkSchedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column('timestamptz')
  @CreateDateColumn()
  workMonth!: Date;

  @Column('timestamptz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.calendar)
  @JoinColumn()
  user!: User;

  @OneToMany(
    (type) => WorkScheduleFiles,
    (workScheduleFile) => workScheduleFile.workSchedule,
  )
  workScheduleFile: WorkScheduleFiles[];
}
