var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user-entity.js';
let Team = class Team {
    id;
    name;
    shortName;
    logo;
    color;
    foundedYear;
    stadium;
    country;
    league;
    defaultFormation;
    squad;
    fans;
    isActive;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Team.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], Team.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "shortName", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "logo", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "color", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Team.prototype, "foundedYear", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "stadium", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "country", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "league", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Array)
], Team.prototype, "defaultFormation", void 0);
__decorate([
    Column('json', { nullable: true }),
    __metadata("design:type", Array)
], Team.prototype, "squad", void 0);
__decorate([
    ManyToMany(() => User, (user) => user.favoriteTeams),
    __metadata("design:type", Array)
], Team.prototype, "fans", void 0);
__decorate([
    Column({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Team.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Team.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Team.prototype, "updatedAt", void 0);
Team = __decorate([
    Entity()
], Team);
export { Team };
//# sourceMappingURL=Team.js.map