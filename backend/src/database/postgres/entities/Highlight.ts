import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user-entity.js';
import { Post } from './post-entity.js';
import { Sport } from './Sport.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';

@Entity()
export class Highlight {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  videoUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl!: string;

  @Column('int', { default: 0 })
  duration!: number; // in seconds

  @Column('json', { nullable: true })
  tags!: string[];

  @Column({ type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column('int', { default: 0 })
  views!: number;

  @Column('int', { default: 0 })
  likes!: number;

  @ManyToOne(() => User, (user: User) => user.highlights)
  author!: User;

  @ManyToOne(() => Sport, (sport: Sport) => sport.highlights)
  sport!: Sport;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  likedBy!: User[];

  @OneToMany(() => TacticalAnalysis, (analysis: TacticalAnalysis) => analysis.highlight)
  tacticalAnalyses!: TacticalAnalysis[];

  @ManyToMany(() => Post, (post: Post) => post.relatedHighlights)
  @JoinTable()
  relatedPosts!: Post[];

  @Column('json', { nullable: true })
  metadata!: {
    matchInfo?: {
      teams: string[];
      score: string;
      date: Date;
      competition: string;
    };
    playerStats?: any;
    performance?: any;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}