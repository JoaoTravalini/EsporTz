import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { Post } from "./post-entity.js";
import type { User } from "./user-entity.js";

@Entity()
export class Mention extends BaseEntity {
    @ManyToOne("Post", "mentions", { onDelete: "CASCADE" })
    @JoinColumn({ name: "postId" })
    post!: Post;

    @Column({ type: "uuid" })
    postId!: string;

    @ManyToOne("User", { onDelete: "CASCADE" })
    @JoinColumn({ name: "mentionedUserId" })
    mentionedUser!: User;

    @Column({ type: "uuid" })
    mentionedUserId!: string;

    @Column({ type: "int", default: 0 })
    position!: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    context!: string | null;
}
