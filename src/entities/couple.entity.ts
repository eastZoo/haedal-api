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

  @Column({ comment: '승인 코드' })
  code: number;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;
}
