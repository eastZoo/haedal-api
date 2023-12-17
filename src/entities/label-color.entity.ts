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
import { Files } from './files.entity';
import { AlbumBoardComment } from './album-board-comment.entity';

@Entity({ name: 'label-color' })
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
