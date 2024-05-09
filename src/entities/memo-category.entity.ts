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
import { Memo } from './memo.entity';

@Entity({ name: 'memo_category' })
export class MemoCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column({ comment: '메모그룹 이름' })
  category: string;

  @Column('timestamptz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.memoCategory)
  @JoinColumn()
  user!: User;

  @OneToMany((type) => Memo, (memo) => memo.memoCategory)
  memos: Memo[];
}
