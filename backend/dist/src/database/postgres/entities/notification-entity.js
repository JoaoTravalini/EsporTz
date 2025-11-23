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
export var NotificationType;
(function (NotificationType) {
    NotificationType["MENTION"] = "mention";
    NotificationType["LIKE"] = "like";
    NotificationType["COMMENT"] = "comment";
    NotificationType["FOLLOW"] = "follow";
    NotificationType["REPOST"] = "repost";
})(NotificationType || (NotificationType = {}));
let Notification = class Notification extends BaseEntity {
    recipient;
    recipientId;
    actor;
    actorId;
    type;
    post;
    postId;
    read;
    message;
};
__decorate([
    ManyToOne("User", { onDelete: "CASCADE" }),
    JoinColumn({ name: "recipientId" }),
    __metadata("design:type", Function)
], Notification.prototype, "recipient", void 0);
__decorate([
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], Notification.prototype, "recipientId", void 0);
__decorate([
    ManyToOne("User", { onDelete: "CASCADE" }),
    JoinColumn({ name: "actorId" }),
    __metadata("design:type", Function)
], Notification.prototype, "actor", void 0);
__decorate([
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], Notification.prototype, "actorId", void 0);
__decorate([
    Column({ type: "varchar", length: 20 }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    ManyToOne("Post", { nullable: true, onDelete: "CASCADE" }),
    JoinColumn({ name: "postId" }),
    __metadata("design:type", Object)
], Notification.prototype, "post", void 0);
__decorate([
    Column({ type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "postId", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "read", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "message", void 0);
Notification = __decorate([
    Entity()
], Notification);
export { Notification };
//# sourceMappingURL=notification-entity.js.map