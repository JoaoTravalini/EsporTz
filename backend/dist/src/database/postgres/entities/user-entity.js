var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import * as bcrypt from "bcrypt";
let User = class User extends BaseEntity {
    name;
    email;
    password;
    imgURL;
    provider;
    bio;
    location;
    website;
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    posts;
    likes;
    reposts;
    following;
    followers;
    // New relationships for sports features
    highlights;
    tacticalAnalyses;
    tacticalComments;
    favoriteTeams;
    followedMatches;
    groups;
    ownedGroups;
    preferences;
    stats;
    // Menções recebidas
    mentions;
    // Notificações recebidas
    notifications;
    // Notificações onde o usuário é o ator
    actorNotifications;
};
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Column({ type: "string", unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column({ type: "string", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "imgURL", void 0);
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "bio", void 0);
__decorate([
    Column({ type: "string", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "location", void 0);
__decorate([
    Column({ type: "string", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "website", void 0);
__decorate([
    BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "hashPassword", null);
__decorate([
    OneToMany("Post", "author"),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    OneToMany("Like", "user"),
    __metadata("design:type", Array)
], User.prototype, "likes", void 0);
__decorate([
    ManyToMany("Post", "repostedBy"),
    JoinTable({ name: 'user_reposts' }),
    __metadata("design:type", Array)
], User.prototype, "reposts", void 0);
__decorate([
    ManyToMany("User", "followers"),
    JoinTable({
        name: 'user_following',
        joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'followed_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], User.prototype, "following", void 0);
__decorate([
    ManyToMany("User", "following"),
    __metadata("design:type", Array)
], User.prototype, "followers", void 0);
__decorate([
    OneToMany("Highlight", "author"),
    __metadata("design:type", Array)
], User.prototype, "highlights", void 0);
__decorate([
    OneToMany("TacticalAnalysis", "author"),
    __metadata("design:type", Array)
], User.prototype, "tacticalAnalyses", void 0);
__decorate([
    OneToMany("TacticalComment", "author"),
    __metadata("design:type", Array)
], User.prototype, "tacticalComments", void 0);
__decorate([
    ManyToMany("Team", "fans"),
    JoinTable({
        name: 'user_favorite_teams',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'team_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], User.prototype, "favoriteTeams", void 0);
__decorate([
    ManyToMany("Match", "followers"),
    JoinTable({
        name: 'user_followed_matches',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'match_id', referencedColumnName: 'id' }
    }),
    __metadata("design:type", Array)
], User.prototype, "followedMatches", void 0);
__decorate([
    ManyToMany("Group", "members"),
    __metadata("design:type", Array)
], User.prototype, "groups", void 0);
__decorate([
    OneToMany("Group", "owner"),
    __metadata("design:type", Array)
], User.prototype, "ownedGroups", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "preferences", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "stats", void 0);
__decorate([
    OneToMany("Mention", "mentionedUser"),
    __metadata("design:type", Array)
], User.prototype, "mentions", void 0);
__decorate([
    OneToMany("Notification", "recipient"),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    OneToMany("Notification", "actor"),
    __metadata("design:type", Array)
], User.prototype, "actorNotifications", void 0);
User = __decorate([
    Entity()
], User);
export { User };
//# sourceMappingURL=user-entity.js.map