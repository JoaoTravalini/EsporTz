import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
import { Sport } from './Sport.js';
import { Team } from './Team.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';
import { MatchEvent } from './MatchEvent.js';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @ManyToOne(() => Team)
  homeTeam!: Team;

  @ManyToOne(() => Team)
  awayTeam!: Team;

  @Column('int')
  homeScore!: number;

  @Column('int')
  awayScore!: number;

  @Column({ type: 'timestamp' })
  matchDate!: Date;

  @Column({ type: 'varchar', nullable: true })
  venue!: string;

  @Column({ type: 'varchar', nullable: true })
  competition!: string;

  @Column('int', { nullable: true })
  duration!: number; // Match duration in minutes

  @Column('json', { nullable: true })
  lineups!: {
    home: Array<{
      player: string;
      position: string;
      number: number;
      captain?: boolean;
    }>;
    away: Array<{
      player: string;
      position: string;
      number: number;
      captain?: boolean;
    }>;
  };

  @Column('json', { nullable: true })
  statistics!: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    passes?: { home: number; away: number };
    passAccuracy?: { home: number; away: number };
    fouls?: { home: number; away: number };
    corners?: { home: number; away: number };
    offsides?: { home: number; away: number };
    yellowCards?: { home: number; away: number };
    redCards?: { home: number; away: number };
  };

  @Column('json', { nullable: true })
  highlights!: {
    videoUrl?: string;
    keyMoments: Array<{
      timestamp: number;
      type: 'goal' | 'chance' | 'save' | 'card' | 'substitution';
      description: string;
    }>;
  };

  @ManyToOne(() => Sport, (sport: Sport) => sport.matches)
  sport!: Sport;

  @ManyToMany(() => User, (user: User) => user.followedMatches)
  followers!: User[];

  @OneToMany(() => TacticalAnalysis, (analysis: TacticalAnalysis) => analysis.match)
  tacticalAnalyses!: TacticalAnalysis[];

  @OneToMany(() => MatchEvent, (event: MatchEvent) => event.match)
  events!: MatchEvent[];

  @Column({ type: 'varchar', default: 'scheduled' })
  status!: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

  @Column({ type: 'boolean', default: false })
  isFeatured!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}