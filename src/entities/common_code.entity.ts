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

@Entity({ name: 'common_code' })
export class CommonCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '공통코드 분류 타입' })
  codeType: string;

  @Column({ comment: '코드', nullable: true })
  code: string;

  @Column({ comment: '이름', nullable: true })
  name: string;

  @Column({ comment: '기타', nullable: true })
  remark: string;

  @Column('timestamptz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;
}
