var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, JoinColumn, JoinTable } from "typeorm";
import { BaseEntity } from "./base-entity.js";
let Post = class Post extends BaseEntity {
    content;
    author;
    parent;
    comments;
    likes;
    repostedBy;
    relatedHighlights;
    workoutActivity;
    workoutActivityId;
    // Para posts com múltiplas atividades (quando usuário seleciona mais de 1 treino)
    workoutActivities;
    // Hashtags do post
    hashtags;
    // Menções no post
    mentions;
};
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    ManyToOne("User", "posts", { onDelete: "CASCADE" }),
    __metadata("design:type", Function)
], Post.prototype, "author", void 0);
__decorate([
    ManyToOne("Post", "comments", { nullable: true, onDelete: "CASCADE" }),
    __metadata("design:type", Object)
], Post.prototype, "parent", void 0);
__decorate([
    OneToMany("Post", "parent"),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
__decorate([
    OneToMany("Like", "post"),
    __metadata("design:type", Array)
], Post.prototype, "likes", void 0);
__decorate([
    ManyToMany("User", "reposts"),
    __metadata("design:type", Array)
], Post.prototype, "repostedBy", void 0);
__decorate([
    ManyToMany("Highlight", "relatedPosts"),
    __metadata("design:type", Array)
], Post.prototype, "relatedHighlights", void 0);
__decorate([
    ManyToOne("WorkoutActivity", "posts", { nullable: true }),
    JoinColumn({ name: "workoutActivityId" }),
    __metadata("design:type", Function)
], Post.prototype, "workoutActivity", void 0);
__decorate([
    Column({ type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], Post.prototype, "workoutActivityId", void 0);
__decorate([
    ManyToMany("WorkoutActivity", "linkedPosts"),
    JoinTable({
        name: "post_workout_activities",
        joinColumn: { name: "postId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workoutActivityId", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], Post.prototype, "workoutActivities", void 0);
__decorate([
    ManyToMany("Hashtag", "posts"),
    JoinTable({
        name: "post_hashtags",
        joinColumn: { name: "postId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "hashtagId", referencedColumnName: "id" }
    }),
    __metadata("design:type", Array)
], Post.prototype, "hashtags", void 0);
__decorate([
    OneToMany("Mention", "post"),
    __metadata("design:type", Array)
], Post.prototype, "mentions", void 0);
Post = __decorate([
    Entity()
], Post);
export { Post };
//# sourceMappingURL=post-entity.js.map