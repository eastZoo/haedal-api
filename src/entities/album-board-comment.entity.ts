import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { AlbumBoard } from './album-board.entity';

@Entity({ name: 'album_board_comment' })
export class AlbumBoardComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ comment: '댓글 내용' })
  content!: string;

  @Column('timestampz')
  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('uuid')
  userId?: string;

  @Column('uuid')
  albumBoardId?: string;

  @ManyToOne((type) => AlbumBoard, (albumBoard) => albumBoard.comments)
  albumBoard: AlbumBoard;

  @ManyToOne((type) => User, (user) => user.comment)
  user: User;

  // @ManyToOne((type) => User, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // user!: User;

  // @ManyToOne((type) => Menu, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // menu!: Menu;

  // @OneToOne((type) => Menu, (menu) => menu.children)
  // parent: Menu;

  // @OneToMany((type) => Menu, (menu) => menu.parent)
  // children: Menu;
}
