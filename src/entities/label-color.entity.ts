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

@Entity({ name: 'label_color' })
export class LabelColor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '색깔코드' })
  code: string;

  @Column({ comment: '색이름' })
  name: string;

  @Column('timestamptz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;
}
