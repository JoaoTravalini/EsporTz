var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity.js";
let Group = class Group extends BaseEntity {
    name;
    description;
    imgURL;
    slug;
    privacy;
    members;
    owner;
    settings;
};
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], Group.prototype, "description", void 0);
__decorate([
    Column({ type: "string", nullable: true }),
    __metadata("design:type", Object)
], Group.prototype, "imgURL", void 0);
__decorate([
    Column({ type: "string", unique: true }),
    __metadata("design:type", String)
], Group.prototype, "slug", void 0);
__decorate([
    Column({ type: "string", default: "public" }),
    __metadata("design:type", String)
], Group.prototype, "privacy", void 0);
__decorate([
    ManyToMany("User", "groups"),
    JoinTable({
        name: 'group_members',
        joinColumn: { name: 'group_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], Group.prototype, "members", void 0);
__decorate([
    ManyToOne("User", "ownedGroups"),
    __metadata("design:type", Function)
], Group.prototype, "owner", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], Group.prototype, "settings", void 0);
Group = __decorate([
    Entity()
], Group);
export { Group };
//# sourceMappingURL=group-entity.js.map