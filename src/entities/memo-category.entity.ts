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

  @Column({ comment: '메모 분류 카테 고리' })
  category: string;

  @Column({ comment: '메모 분류 제목', nullable: true })
  title: string;

  @Column({ comment: '메모그룹 색깔', nullable: true })
  color: string;

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

  @Column({ comment: '삭제 유무', default: false })
  isDeleted: boolean;
}
