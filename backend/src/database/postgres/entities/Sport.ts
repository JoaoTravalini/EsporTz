import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Highlight } from './Highlight.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';
import { Match } from './Match.js';

@Entity()
export class Sport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  icon!: string;

  @Column({ type: 'varchar', nullable: true })
  color!: string;

  @Column('json', { nullable: true })
  defaultFormation!: {
    positions: string[];
    layout: string[][];
  };

  @Column('json', { nullable: true })
  metrics!: {
    keyStats: string[];
    units: Record<string, string>;
  };

  @OneToMany(() => Highlight, (highlight: Highlight) => highlight.sport)
  highlights!: Highlight[];

  @OneToMany(() => TacticalAnalysis, (analysis: TacticalAnalysis) => analysis.sport)
  tacticalAnalyses!: TacticalAnalysis[];

  @OneToMany(() => Match, (match: Match) => match.sport)
  matches!: Match[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}