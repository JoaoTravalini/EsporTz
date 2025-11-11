import { Column, Entity, ManyToMany } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { Post } from "./post-entity.js";

@Entity()
export class Hashtag extends BaseEntity {
    @Column({ type: "varchar", unique: true, length: 50 })
    tag!: string; // lowercase, sem o #
    
    @Column({ type: "varchar", length: 50 })
    displayTag!: string; // com capitalização original
    
    @Column({ type: "int", default: 0 })
    postCount!: number; // cache de contagem
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    lastUsedAt!: Date;
    
    @ManyToMany("Post", "hashtags")
    posts!: Post[];
}
