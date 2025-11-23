var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./base-entity.js";
let Hashtag = class Hashtag extends BaseEntity {
    tag; // lowercase, sem o #
    displayTag; // com capitalização original
    postCount; // cache de contagem
    lastUsedAt;
    posts;
};
__decorate([
    Column({ type: "varchar", unique: true, length: 50 }),
    __metadata("design:type", String)
], Hashtag.prototype, "tag", void 0);
__decorate([
    Column({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Hashtag.prototype, "displayTag", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Hashtag.prototype, "postCount", void 0);
__decorate([
    Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Hashtag.prototype, "lastUsedAt", void 0);
__decorate([
    ManyToMany("Post", "hashtags"),
    __metadata("design:type", Array)
], Hashtag.prototype, "posts", void 0);
Hashtag = __decorate([
    Entity()
], Hashtag);
export { Hashtag };
//# sourceMappingURL=hashtag-entity.js.map