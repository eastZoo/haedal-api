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
  @Column({ comment: '유저 이름' })
  name: string;

  @Index()
  @Column({ unique: true, comment: '유저 아이디' })
  userId: string;

  @Column({ comment: '유저 비밀번호' })
  password: string;

  @Column({ comment: '생일' })
  birth: string;

  @Column({ comment: '나이' })
  age: number;

  @Column({ comment: '성별' })
  sex: string;

  @Column({ comment: '휴대폰 번호' })
  phoneNumber: string;

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
