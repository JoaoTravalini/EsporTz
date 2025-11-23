var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.js";
let Mention = class Mention extends BaseEntity {
    post;
    postId;
    mentionedUser;
    mentionedUserId;
    position;
    context;
};
__decorate([
    ManyToOne("Post", "mentions", { onDelete: "CASCADE" }),
    JoinColumn({ name: "postId" }),
    __metadata("design:type", Function)
], Mention.prototype, "post", void 0);
__decorate([
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], Mention.prototype, "postId", void 0);
__decorate([
    ManyToOne("User", { onDelete: "CASCADE" }),
    JoinColumn({ name: "mentionedUserId" }),
    __metadata("design:type", Function)
], Mention.prototype, "mentionedUser", void 0);
__decorate([
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], Mention.prototype, "mentionedUserId", void 0);
__decorate([
    Column({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Mention.prototype, "position", void 0);
__decorate([
    Column({ type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", Object)
], Mention.prototype, "context", void 0);
Mention = __decorate([
    Entity()
], Mention);
export { Mention };
//# sourceMappingURL=mention-entity.js.map