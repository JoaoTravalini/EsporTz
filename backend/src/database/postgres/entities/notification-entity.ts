import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { User } from "./user-entity.js";
import type { Post } from "./post-entity.js";

export enum NotificationType {
    MENTION = "mention",
    LIKE = "like",
    COMMENT = "comment",
    FOLLOW = "follow",
    REPOST = "repost"
}

@Entity()
export class Notification extends BaseEntity {
    @ManyToOne("User", { onDelete: "CASCADE" })
    @JoinColumn({ name: "recipientId" })
    recipient!: User;

    @Column({ type: "uuid" })
    recipientId!: string;

    @ManyToOne("User", { onDelete: "CASCADE" })
    @JoinColumn({ name: "actorId" })
    actor!: User;

    @Column({ type: "uuid" })
    actorId!: string;

    @Column({ type: "varchar", length: 20 })
    type!: NotificationType;

    @ManyToOne("Post", { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "postId" })
    post?: Post | null;

    @Column({ type: "uuid", nullable: true })
    postId?: string | null;

    @Column({ type: "boolean", default: false })
    read!: boolean;

    @Column({ type: "text", nullable: true })
    message?: string | null;
}
