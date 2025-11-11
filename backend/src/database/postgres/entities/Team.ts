import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
import { Match } from './Match.js';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  shortName!: string;

  @Column({ type: 'varchar', nullable: true })
  logo!: string;

  @Column({ type: 'varchar', nullable: true })
  color!: string;

  @Column({ type: 'int', nullable: true })
  foundedYear!: number;

  @Column({ type: 'varchar', nullable: true })
  stadium!: string;

  @Column({ type: 'varchar', nullable: true })
  country!: string;

  @Column({ type: 'varchar', nullable: true })
  league!: string;

  @Column('json', { nullable: true })
  defaultFormation!: string[];

  @Column('json', { nullable: true })
  squad!: Array<{
    name: string;
    position: string;
    number: number;
    nationality?: string;
    age?: number;
  }>;

  @ManyToMany(() => User, (user: User) => user.favoriteTeams)
  fans!: User[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}