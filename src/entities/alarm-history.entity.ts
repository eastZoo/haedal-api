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
import { AlarmReadStatus } from './alarm_read_status.entity';

@Entity({ name: 'alarm_history' })
export class AlarmHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '알람 id(다른 게시판의 id)' })
  alarmId: string;

  @Column({ comment: '알람 타입(메모, 캘린더, 게시판, 생일, 기념일 )' })
  type!: string;

  @Column({ comment: '게시글일때 업로드 사진 갯수', nullable: true })
  pic_qty?: number;

  @Column({ comment: '내용', nullable: true })
  content?: string;

  @Column({ comment: '서브내용', nullable: true })
  sub_content?: string;

  @Column({ comment: 'crud 타입', nullable: true })
  crud?: string;

  @Column({ type: 'uuid', comment: '알람 행동 유저 id' })
  userId?: string;

  @Column({ type: 'uuid', comment: '커플 공통 id' })
  coupleId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.alarmHistory)
  @JoinColumn()
  user!: User;

  @OneToMany(() => AlarmReadStatus, (status) => status.alarmHistory)
  alarmReadStatuses!: AlarmReadStatus[];
}
