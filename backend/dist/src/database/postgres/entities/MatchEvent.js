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
import { Match } from './Match.js';
import { User } from './user-entity.js';
let MatchEvent = class MatchEvent {
    id;
    type;
    minute;
    addedTime;
    team;
    player;
    relatedPlayer;
    description;
    match;
    reportedBy;
    isVerified;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], MatchEvent.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], MatchEvent.prototype, "type", void 0);
__decorate([
    Column('int'),
    __metadata("design:type", Number)
], MatchEvent.prototype, "minute", void 0);
__decorate([
    Column('int', { nullable: true }),
    __metadata("design:type", Number)
], MatchEvent.prototype, "addedTime", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], MatchEvent.prototype, "team", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], MatchEvent.prototype, "player", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], MatchEvent.prototype, "relatedPlayer", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MatchEvent.prototype, "description", void 0);
__decorate([
    ManyToOne(() => Match, (match) => match.events),
    __metadata("design:type", Object)
], MatchEvent.prototype, "match", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true }),
    __metadata("design:type", Object)
], MatchEvent.prototype, "reportedBy", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MatchEvent.prototype, "isVerified", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], MatchEvent.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], MatchEvent.prototype, "updatedAt", void 0);
MatchEvent = __decorate([
    Entity()
], MatchEvent);
export { MatchEvent };
//# sourceMappingURL=MatchEvent.js.map