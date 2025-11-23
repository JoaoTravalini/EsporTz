var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Highlight } from './Highlight.js';
import { TacticalAnalysis } from './TacticalAnalysis.js';
import { Match } from './Match.js';
let Sport = class Sport {
    id;
    name;
    description;
    icon;
    color;
    defaultFormation;
    metrics;
    highlights;
    tacticalAnalyses;
    matches;
    isActive;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Sport.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], Sport.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Sport.prototype, "description", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Sport.prototype, "icon", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Sport.prototype, "color", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "defaultFormation", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Object)
], Sport.prototype, "metrics", void 0);
__decorate([
    OneToMany(() => Highlight, (highlight) => highlight.sport),
    __metadata("design:type", Array)
], Sport.prototype, "highlights", void 0);
__decorate([
    OneToMany(() => TacticalAnalysis, (analysis) => analysis.sport),
    __metadata("design:type", Array)
], Sport.prototype, "tacticalAnalyses", void 0);
__decorate([
    OneToMany(() => Match, (match) => match.sport),
    __metadata("design:type", Array)
], Sport.prototype, "matches", void 0);
__decorate([
    Column({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Sport.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Sport.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Sport.prototype, "updatedAt", void 0);
Sport = __decorate([
    Entity()
], Sport);
export { Sport };
//# sourceMappingURL=Sport.js.map