import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Match } from './Match.js';
import { User } from './user-entity.js';

@Entity()
export class MatchEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  type!: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'var' | 'penalty' | 'free_kick' | 'corner' | 'offside' | 'foul';

  @Column('int')
  minute!: number;

  @Column('int', { nullable: true })
  addedTime!: number;

  @Column({ type: 'varchar' })
  team!: 'home' | 'away';

  @Column({ type: 'varchar', nullable: true })
  player!: string;

  @Column({ type: 'varchar', nullable: true })
  relatedPlayer!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @ManyToOne(() => Match, (match: Match) => match.events)
  match!: Match;

  @ManyToOne(() => User, { nullable: true })
  reportedBy!: User;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}