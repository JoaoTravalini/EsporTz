import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';

@Entity()
export class TacticalComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @Column('int', { nullable: true })
  timestamp!: number; // Video timestamp in seconds

  @Column('json', { nullable: true })
  drawingData!: {
    type: 'arrow' | 'circle' | 'line' | 'text';
    coordinates: number[];
    color?: string;
    size?: number;
  }[];

  @ManyToOne(() => User, (user: User) => user.tacticalComments)
  author!: User;

  @ManyToOne(() => TacticalAnalysis, (analysis: TacticalAnalysis) => analysis.comments)
  analysis!: TacticalAnalysis;

  @ManyToOne(() => TacticalComment, { nullable: true })
  parent: TacticalComment | null = null;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'int', default: 0 })
  likes!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}