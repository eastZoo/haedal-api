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

@Entity({ name: 'album_board' })
export class AlbumBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  coupleId?: string;

  @Column({ comment: '제목' })
  title: string;

  @Column({ comment: '타입(카페,음식점, 숙소)', nullable: true })
  category: string;

  @Column({ comment: '내용', nullable: true })
  content: string;

  @Column({ comment: '위도', type: 'decimal' })
  lat!: number;

  @Column({ comment: '경도', type: 'decimal' })
  lng!: number;

  @Column({ comment: '주소', nullable: true })
  address!: string;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.albumBoard)
  @JoinColumn()
  user!: User;

  @OneToMany((type) => AlbumBoardComment, (comment) => comment.albumBoard)
  comments: AlbumBoardComment[];

  @OneToMany((type) => Files, (files) => files.albumBoard)
  files: Files[];
}
