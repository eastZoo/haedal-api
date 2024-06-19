import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

//content(내용), pic_qty, type , alarmId
@Entity({ name: 'alarm_history' })
export class AlarmHistory {
  @PrimaryGeneratedColumn({ comment: '게시글/캘린더 uuid' })
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

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.alarmHistory)
  @JoinColumn()
  user!: User;
}
