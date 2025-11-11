import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { User } from "./user-entity.js";
import type { Post } from "./post-entity.js";

export enum WorkoutType {
    RUN = "run",
    RIDE = "ride",
    SWIM = "swim",
    WORKOUT = "workout",
    WALK = "walk",
    HIKE = "hike",
    ALPINESKI = "alpineski",
    BACKCOUNTRYSKI = "backcountryski",
    NORDICSKI = "nordicski",
    SNOWBOARD = "snowboard",
    KAYAKING = "kayaking",
    EBIKERIDE = "ebikeride",
    VIRTUALRIDE = "virtualride"
}

@Entity({ name: "workout_activities" })
export class WorkoutActivity extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    @Index()
    stravaId!: string;

    @Column({ type: "varchar", length: 255 })
    @Index()
    athleteId!: string;

    @ManyToOne("User", { nullable: true })
    @JoinColumn({ name: "userId" })
    user?: User;

    @Column({ type: "uuid", nullable: true })
    userId?: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 50 })
    type!: WorkoutType;

    @Column({ type: "varchar", length: 50, nullable: true })
    sportType?: string;

    @Column({ type: "timestamptz" })
    startDate!: Date;

    @Column({ type: "timestamptz", nullable: true })
    endDate?: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    distance?: number; // em metros

    @Column({ type: "integer", nullable: true })
    movingTime?: number; // em segundos

    @Column({ type: "integer", nullable: true })
    elapsedTime?: number; // em segundos

    @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
    averageSpeed?: number; // m/s

    @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
    maxSpeed?: number; // m/s

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    averageHeartRate?: number;

    @Column({ type: "integer", nullable: true })
    maxHeartRate?: number;

    @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
    averageCadence?: number;

    @Column({ type: "decimal", precision: 6, scale: 2, nullable: true })
    averagePower?: number;

    @Column({ type: "integer", nullable: true })
    maxPower?: number;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    elevationGain?: number; // em metros

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    elevationLoss?: number; // em metros

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    elevationHigh?: number; // em metros

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    elevationLow?: number; // em metros

    @Column({ type: "json", nullable: true })
    polyline?: string; // coordenadas do percurso

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "json", nullable: true })
    rawStravaData?: any; // dados brutos da API Strava

    @Column({ type: "boolean", default: false })
    isPrivate!: boolean;

    @Column({ type: "boolean", default: false })
    hasKudo!: boolean;

    @Column({ type: "integer", nullable: true })
    kudosCount?: number;

    @Column({ type: "integer", nullable: true })
    commentCount?: number;

    @Column({ type: "integer", nullable: true })
    photoCount?: number;

    @Column({ type: "timestamptz", nullable: true })
    lastSyncAt?: Date;

    @OneToMany("Post", "workoutActivity")
    posts?: Post[];

    @ManyToMany("Post", "workoutActivities")
    linkedPosts?: Post[];
}