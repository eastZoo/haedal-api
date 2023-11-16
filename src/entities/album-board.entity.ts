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

@Entity({ name: 'album-board' })
export class AlbumBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '제목' })
  title: string;

  @Column({ comment: '내용' })
  content: string;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany((type) => Files, (files) => files.albumBoard)
  files: Files[];

  @ManyToOne((type) => User, (user) => user.albumBoard)
  @JoinColumn()
  user!: User;

  @Column('uuid')
  userId?: string;
}
