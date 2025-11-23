var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';
let TacticalComment = class TacticalComment {
    id;
    content;
    timestamp; // Video timestamp in seconds
    drawingData;
    author;
    analysis;
    parent = null;
    isVerified;
    likes;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], TacticalComment.prototype, "id", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], TacticalComment.prototype, "content", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], TacticalComment.prototype, "timestamp", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Array)
], TacticalComment.prototype, "drawingData", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.tacticalComments),
    __metadata("design:type", Object)
], TacticalComment.prototype, "author", void 0);
__decorate([
    ManyToOne(() => TacticalAnalysis, (analysis) => analysis.comments),
    __metadata("design:type", Object)
], TacticalComment.prototype, "analysis", void 0);
__decorate([
    ManyToOne(() => TacticalComment, { nullable: true }),
    __metadata("design:type", Object)
], TacticalComment.prototype, "parent", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TacticalComment.prototype, "isVerified", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TacticalComment.prototype, "likes", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], TacticalComment.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], TacticalComment.prototype, "updatedAt", void 0);
TacticalComment = __decorate([
    Entity()
], TacticalComment);
export { TacticalComment };
//# sourceMappingURL=TacticalComment.js.map