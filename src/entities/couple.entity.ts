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

@Entity({ name: 'couple' })
export class Couple {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '내 아이디' })
  myId: string;

  @Column({ comment: '파트너 아이디', nullable: true })
  partnerId: string;

  @Column({ comment: '처음만난날', nullable: true })
  firstDay: Date;

  @Column({
    comment: '홈 배경화면',
    nullable: true,
    default: 'uploads/0762031d-99ff-41f9-b8ba-d20376e52c87.png',
  })
  homeProfileUrl: string;

  @Column({ comment: '승인 코드' })
  code: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
