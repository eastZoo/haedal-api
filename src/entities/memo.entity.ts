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
import { MemoCategory } from './memo-category.entity';

@Entity({ name: 'memo' })
export class Memo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column({ type: 'uuid', comment: '메모 그룹 부모 아이디' })
  memoCategoryId: string;

  @Column({ comment: '메모' })
  memo: string;

  @Column({ type: 'boolean', default: false })
  isDone: boolean;

  @Column('timestamptz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.memoCategory)
  @JoinColumn()
  user!: User;

  @ManyToOne((type) => MemoCategory, (memoCategory) => memoCategory.memos)
  memoCategory: MemoCategory;

  @Column({ comment: '삭제 유무', default: false })
  isDeleted: boolean;
}
