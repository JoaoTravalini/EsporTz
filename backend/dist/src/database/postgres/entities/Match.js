var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
import { Sport } from './Sport.js';
import { Team } from './Team.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';
import { MatchEvent } from './MatchEvent.js';
let Match = class Match {
    id;
    title;
    homeTeam;
    awayTeam;
    homeScore;
    awayScore;
    matchDate;
    venue;
    competition;
    duration; // Match duration in minutes
    lineups;
    statistics;
    highlights;
    sport;
    followers;
    tacticalAnalyses;
    events;
    status;
    isFeatured;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Match.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], Match.prototype, "title", void 0);
__decorate([
    ManyToOne(() => Team),
    __metadata("design:type", Object)
], Match.prototype, "homeTeam", void 0);
__decorate([
    ManyToOne(() => Team),
    __metadata("design:type", Object)
], Match.prototype, "awayTeam", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Match.prototype, "homeScore", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], Match.prototype, "awayScore", void 0);
__decorate([
    Column({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Match.prototype, "matchDate", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "venue", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "competition", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], Match.prototype, "duration", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "lineups", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "statistics", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "highlights", void 0);
__decorate([
    ManyToOne(() => Sport, (sport) => sport.matches),
    __metadata("design:type", Object)
], Match.prototype, "sport", void 0);
__decorate([
    ManyToMany(() => User, (user) => user.followedMatches),
    __metadata("design:type", Array)
], Match.prototype, "followers", void 0);
__decorate([
    OneToMany(() => TacticalAnalysis, (analysis) => analysis.match),
    __metadata("design:type", Array)
], Match.prototype, "tacticalAnalyses", void 0);
__decorate([
    OneToMany(() => MatchEvent, (event) => event.match),
    __metadata("design:type", Array)
], Match.prototype, "events", void 0);
__decorate([
    Column({ type: 'varchar', default: 'scheduled' }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Match.prototype, "isFeatured", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Match.prototype, "updatedAt", void 0);
Match = __decorate([
    Entity()
], Match);
export { Match };
//# sourceMappingURL=Match.js.map