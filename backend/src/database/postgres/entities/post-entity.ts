import { Column, Entity, ManyToMany, ManyToOne, OneToMany, JoinColumn, JoinTable } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { User } from "./user-entity.js";
import type { Like } from "./like-entity.js";
import type { Highlight } from "./Highlight.js";
import type { WorkoutActivity } from "./workout-activity.js";
import type { Hashtag } from "./hashtag-entity.js";
import type { Mention } from "./mention-entity.js";

@Entity()
export class Post extends BaseEntity {
    @Column({ type: "string" })
    content!: string;

    @ManyToOne("User", "posts", { onDelete: "CASCADE" })
    author!: User;

    @ManyToOne("Post", "comments", { nullable: true, onDelete: "CASCADE" })
    parent!: Post | null;

    @OneToMany("Post", "parent")
    comments!: Post[];

    @OneToMany("Like", "post")
    likes!: Like[];

    @ManyToMany("User", "reposts")
    repostedBy!: User[];

    @ManyToMany("Highlight", "relatedPosts")
    relatedHighlights!: Highlight[];

    @ManyToOne("WorkoutActivity", "posts", { nullable: true })
    @JoinColumn({ name: "workoutActivityId" })
    workoutActivity?: WorkoutActivity;

    @Column({ type: "uuid", nullable: true })
    workoutActivityId?: string | null;

    // Para posts com múltiplas atividades (quando usuário seleciona mais de 1 treino)
    @ManyToMany("WorkoutActivity", "linkedPosts")
    @JoinTable({
        name: "post_workout_activities",
        joinColumn: { name: "postId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "workoutActivityId", referencedColumnName: "id" }
    })
    workoutActivities?: WorkoutActivity[];

    // Hashtags do post
    @ManyToMany("Hashtag", "posts")
    @JoinTable({
        name: "post_hashtags",
        joinColumn: { name: "postId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "hashtagId", referencedColumnName: "id" }
    })
    hashtags!: Hashtag[];

    // Menções no post
    @OneToMany("Mention", "post")
    mentions!: Mention[];
}