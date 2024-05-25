import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlbumBoard } from './album-board.entity';
import { AlbumBoardComment } from './album-board-comment.entity';
import { Calendar } from './calendar.entity';
import { MemoCategory } from './memo-category.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ comment: '유저 이름', nullable: true })
  name: string;

  @Column({ comment: '커플테이블 아이디', nullable: true })
  coupleId: string;

  @Column({ comment: '로그인 유형' })
  provider: string;

  @Column({
    comment: '소셜 프로바이더의 유저 ID (일반 로그인 시 null)',
    nullable: true,
  })
  providerUserId: string;

  @Index()
  @Column({ unique: true, comment: '유저 이메일' })
  userEmail: string;

  @Column({ comment: '유저 비밀번호', nullable: true })
  password: string;

  @Column({ comment: '생일', nullable: true })
  birth: Date;

  @Column({ comment: '나이', nullable: true })
  age: number;

  @Column({ comment: '성별', nullable: true })
  sex: string;

  @Column({ comment: '휴대폰 번호', nullable: true })
  phoneNumber: string;

  @Column({ comment: '처음만난날', nullable: true })
  firstDay: Date;

  @Column({
    comment:
      '연결 진행 상태( 1: 승인코드 미입력 , 2:개인정보 미입력, 3: 모두입력 )',
    nullable: true,
  })
  connectState: number;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany((type) => AlbumBoardComment, (comment) => comment.user)
  comment: AlbumBoardComment;

  @OneToMany((type) => AlbumBoard, (albumBoard) => albumBoard.user)
  albumBoard: AlbumBoard;

  @OneToMany((type) => Calendar, (calendar) => calendar.user)
  calendar: Calendar;

  @OneToMany((type) => MemoCategory, (memoCategory) => memoCategory.user)
  memoCategory: MemoCategory;

  @BeforeInsert()
  async setPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
