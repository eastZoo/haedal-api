import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AlarmHistory } from './alarm-history.entity';

@Entity({ name: 'alarm_read_status' })
export class AlarmReadStatus {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @PrimaryColumn('uuid')
  alarmHistoryId!: string;

  @Column({ type: 'boolean', default: false, comment: '읽음 상태' })
  isRead!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.alarmReadStatuses)
  user!: User;

  @ManyToOne(() => AlarmHistory, (history) => history.alarmReadStatuses)
  alarmHistory!: AlarmHistory;
}
