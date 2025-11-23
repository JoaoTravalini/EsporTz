var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user-entity.js';
import { Post } from './post-entity.js';
import { Sport } from './Sport.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';
let Highlight = class Highlight {
    id;
    title;
    description;
    videoUrl;
    imageUrl;
    thumbnailUrl;
    duration; // in seconds
    tags;
    isFeatured;
    isPublic;
    views;
    likes;
    author;
    sport;
    likedBy;
    tacticalAnalyses;
    relatedPosts;
    metadata;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Highlight.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Highlight.prototype, "title", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Highlight.prototype, "description", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Highlight.prototype, "videoUrl", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Highlight.prototype, "imageUrl", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Highlight.prototype, "thumbnailUrl", void 0);
__decorate([
    Column('int', { default: 0 }),
    __metadata("design:type", Number)
], Highlight.prototype, "duration", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Array)
], Highlight.prototype, "tags", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Highlight.prototype, "isFeatured", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Highlight.prototype, "isPublic", void 0);
__decorate([
    Column('int', { default: 0 }),
    __metadata("design:type", Number)
], Highlight.prototype, "views", void 0);
__decorate([
    Column('int', { default: 0 }),
    __metadata("design:type", Number)
], Highlight.prototype, "likes", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.highlights),
    __metadata("design:type", Object)
], Highlight.prototype, "author", void 0);
__decorate([
    ManyToOne(() => Sport, (sport) => sport.highlights),
    __metadata("design:type", Object)
], Highlight.prototype, "sport", void 0);
__decorate([
    ManyToMany(() => User, { cascade: true }),
    JoinTable(),
    __metadata("design:type", Array)
], Highlight.prototype, "likedBy", void 0);
__decorate([
    OneToMany(() => TacticalAnalysis, (analysis) => analysis.highlight),
    __metadata("design:type", Array)
], Highlight.prototype, "tacticalAnalyses", void 0);
__decorate([
    ManyToMany(() => Post, (post) => post.relatedHighlights),
    JoinTable(),
    __metadata("design:type", Array)
], Highlight.prototype, "relatedPosts", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Highlight.prototype, "metadata", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Highlight.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Highlight.prototype, "updatedAt", void 0);
Highlight = __decorate([
    Entity()
], Highlight);
export { Highlight };
//# sourceMappingURL=Highlight.js.map