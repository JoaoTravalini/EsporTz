import { Column, Entity, ManyToOne, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { Post } from "./post-entity.js";
import type { WorkoutActivity } from "./workout-activity.js";

@Entity({ name: "post_workout_activities" })
export class PostWorkoutActivity {
    @PrimaryColumn({ type: "uuid" })
    postId!: string;

    @PrimaryColumn({ type: "uuid" })
    workoutActivityId!: string;

    @ManyToOne("Post", { onDelete: "CASCADE" })
    post!: Post;

    @ManyToOne("WorkoutActivity", { onDelete: "CASCADE" })
    workoutActivity!: WorkoutActivity;

    @CreateDateColumn({ type: "timestamptz", name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
    updatedAt!: Date;
}