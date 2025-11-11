import { Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { Post } from "./post-entity.js";
import type { User } from "./user-entity.js";

@Entity()
export class Like extends BaseEntity  {
    @ManyToOne("Post", "likes", { onDelete: "CASCADE" })
    post!: Post;

    @ManyToOne("User", "likes", { onDelete: "CASCADE" })
    user!: User;
}