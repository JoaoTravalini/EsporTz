import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn, type Relation } from 'typeorm';
import { User } from './user-entity.js';
import { Sport } from './Sport.js';
import { Highlight } from './Highlight.js';
import { Match } from './Match.js';
import { TacticalComment } from './TacticalComment.js';

@Entity()
export class TacticalAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column('text')
  content!: string;

  @Column('json', { nullable: true })
  formation: {
    home: {
      formation: string[];
      positions: Array<{ x: number; y: number; player?: string; role?: string }>;
    };
    away: {
      formation: string[];
      positions: Array<{ x: number; y: number; player?: string; role?: string }>;
    };
  } | null = null;

  @Column('json', { nullable: true })
  tacticalPatterns: {
    name: string;
    description: string;
    type: 'offensive' | 'defensive' | 'transition';
    positions: Array<{ x: number; y: number; type: string }>;
  }[] | null = null;

  @Column('json', { nullable: true })
  keyMoments: {
    timestamp: number;
    description: string;
    type: 'goal' | 'chance' | 'save' | 'tactical_change' | 'substitution';
    importance: 'low' | 'medium' | 'high' | 'critical';
  }[] | null = null;

  @Column('text', { nullable: true })
  aiInsights: string | null = null;

  @Column('json', { nullable: true })
  statistics: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    passes?: { home: number; away: number };
    fouls?: { home: number; away: number };
    custom?: Record<string, any>;
  } | null = null;

  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @ManyToOne(() => User, (user: User) => user.tacticalAnalyses)
  author!: Relation<User>;

  @ManyToOne(() => Sport, (sport: Sport) => sport.tacticalAnalyses)
  sport!: Relation<Sport>;

  @ManyToOne(() => Highlight, (highlight: Highlight) => highlight.tacticalAnalyses, { nullable: true })
  highlight: Relation<Highlight> | null = null;

  @ManyToOne(() => Match, (match: Match) => match.tacticalAnalyses, { nullable: true })
  match: Relation<Match> | null = null;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  likedBy!: Relation<User>[];

  @OneToMany(() => TacticalComment, (comment: TacticalComment) => comment.analysis)
  comments!: Relation<TacticalComment>[];

  @Column('int', { default: 0 })
  likes!: number;

  @Column('int', { default: 0 })
  views!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}