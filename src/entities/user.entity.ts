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

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ comment: '유저 이름', nullable: true })
  name: string;

  @Index()
  @Column({ unique: true, comment: '유저 이메일' })
  userEmail: string;

  @Column({ comment: '유저 비밀번호' })
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

  @BeforeInsert()
  async setPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
