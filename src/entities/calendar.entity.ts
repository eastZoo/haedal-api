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

@Entity({ name: 'calendar' })
export class Calendar {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column({ comment: '제목' })
  title: string;

  @Column({ comment: '메모', nullable: true })
  content: string;

  @Column({ comment: '코드색깔', nullable: true })
  color: string;

  @Column({ comment: '종일' })
  allDay!: boolean;

  @Column({ type: 'timestamptz', comment: '시작날짜', nullable: true })
  @CreateDateColumn()
  startDate: Date;

  @Column({ type: 'timestamptz', comment: '끝날짜', nullable: true })
  @CreateDateColumn()
  endDate: Date;

  @Column('timestamptz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.calendar)
  @JoinColumn()
  user!: User;
}
