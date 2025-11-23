var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
import { Sport } from './Sport.js';
import { Highlight } from './Highlight.js';
import { Match } from './Match.js';
import { TacticalComment } from './TacticalComment.js';
let TacticalAnalysis = class TacticalAnalysis {
    id;
    title;
    content;
    formation = null;
    tacticalPatterns = null;
    keyMoments = null;
    aiInsights = null;
    statistics = null;
    isPublic;
    isVerified;
    author;
    sport;
    highlight = null;
    match = null;
    likedBy;
    comments;
    likes;
    views;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TacticalAnalysis.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], TacticalAnalysis.prototype, "title", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], TacticalAnalysis.prototype, "content", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "formation", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "tacticalPatterns", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "keyMoments", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "aiInsights", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "statistics", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TacticalAnalysis.prototype, "isPublic", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TacticalAnalysis.prototype, "isVerified", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.tacticalAnalyses),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "author", void 0);
__decorate([
    ManyToOne(() => Sport, (sport) => sport.tacticalAnalyses),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "sport", void 0);
__decorate([
    ManyToOne(() => Highlight, (highlight) => highlight.tacticalAnalyses, { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "highlight", void 0);
__decorate([
    ManyToOne(() => Match, (match) => match.tacticalAnalyses, { nullable: true }),
    __metadata("design:type", Object)
], TacticalAnalysis.prototype, "match", void 0);
__decorate([
    ManyToMany(() => User, { cascade: true }),
    JoinTable(),
    __metadata("design:type", Array)
], TacticalAnalysis.prototype, "likedBy", void 0);
__decorate([
    OneToMany(() => TacticalComment, (comment) => comment.analysis),
    __metadata("design:type", Array)
], TacticalAnalysis.prototype, "comments", void 0);
__decorate([
    Column('int', { default: 0 }),
    __metadata("design:type", Number)
], TacticalAnalysis.prototype, "likes", void 0);
__decorate([
    Column('int', { default: 0 }),
    __metadata("design:type", Number)
], TacticalAnalysis.prototype, "views", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], TacticalAnalysis.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], TacticalAnalysis.prototype, "updatedAt", void 0);
TacticalAnalysis = __decorate([
    Entity()
], TacticalAnalysis);
export { TacticalAnalysis };
//# sourceMappingURL=TacticalAnalysis.js.map