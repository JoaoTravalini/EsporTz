var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, Index, ManyToMany, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.js";
export var WorkoutType;
(function (WorkoutType) {
    WorkoutType["RUN"] = "run";
    WorkoutType["RIDE"] = "ride";
    WorkoutType["SWIM"] = "swim";
    WorkoutType["WORKOUT"] = "workout";
    WorkoutType["WALK"] = "walk";
    WorkoutType["HIKE"] = "hike";
    WorkoutType["ALPINESKI"] = "alpineski";
    WorkoutType["BACKCOUNTRYSKI"] = "backcountryski";
    WorkoutType["NORDICSKI"] = "nordicski";
    WorkoutType["SNOWBOARD"] = "snowboard";
    WorkoutType["KAYAKING"] = "kayaking";
    WorkoutType["EBIKERIDE"] = "ebikeride";
    WorkoutType["VIRTUALRIDE"] = "virtualride";
})(WorkoutType || (WorkoutType = {}));
let WorkoutActivity = class WorkoutActivity extends BaseEntity {
    stravaId;
    athleteId;
    user;
    userId;
    name;
    type;
    sportType;
    startDate;
    endDate;
    distance; // em metros
    movingTime; // em segundos
    elapsedTime; // em segundos
    averageSpeed; // m/s
    maxSpeed; // m/s
    averageHeartRate;
    maxHeartRate;
    averageCadence;
    averagePower;
    maxPower;
    elevationGain; // em metros
    elevationLoss; // em metros
    elevationHigh; // em metros
    elevationLow; // em metros
    polyline; // coordenadas do percurso
    description;
    rawStravaData; // dados brutos da API Strava
    isPrivate;
    hasKudo;
    kudosCount;
    commentCount;
    photoCount;
    lastSyncAt;
    posts;
    linkedPosts;
};
__decorate([
    Column({ type: "varchar", length: 255 }),
    Index(),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "stravaId", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    Index(),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "athleteId", void 0);
__decorate([
    ManyToOne("User", { nullable: true }),
    JoinColumn({ name: "userId" }),
    __metadata("design:type", Function)
], WorkoutActivity.prototype, "user", void 0);
__decorate([
    Column({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "userId", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "type", void 0);
__decorate([
    Column({ type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "sportType", void 0);
__decorate([
    Column({ type: "timestamptz" }),
    __metadata("design:type", Date)
], WorkoutActivity.prototype, "startDate", void 0);
__decorate([
    Column({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Date)
], WorkoutActivity.prototype, "endDate", void 0);
__decorate([
    Column({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "distance", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "movingTime", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "elapsedTime", void 0);
__decorate([
    Column({ type: "decimal", precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "averageSpeed", void 0);
__decorate([
    Column({ type: "decimal", precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "maxSpeed", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "averageHeartRate", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "maxHeartRate", void 0);
__decorate([
    Column({ type: "decimal", precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "averageCadence", void 0);
__decorate([
    Column({ type: "decimal", precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "averagePower", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "maxPower", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "elevationGain", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "elevationLoss", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "elevationHigh", void 0);
__decorate([
    Column({ type: "decimal", precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "elevationLow", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "polyline", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], WorkoutActivity.prototype, "description", void 0);
__decorate([
    Column({ type: "json", nullable: true }),
    __metadata("design:type", Object)
], WorkoutActivity.prototype, "rawStravaData", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutActivity.prototype, "isPrivate", void 0);
__decorate([
    Column({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], WorkoutActivity.prototype, "hasKudo", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "kudosCount", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "commentCount", void 0);
__decorate([
    Column({ type: "integer", nullable: true }),
    __metadata("design:type", Number)
], WorkoutActivity.prototype, "photoCount", void 0);
__decorate([
    Column({ type: "timestamptz", nullable: true }),
    __metadata("design:type", Date)
], WorkoutActivity.prototype, "lastSyncAt", void 0);
__decorate([
    OneToMany("Post", "workoutActivity"),
    __metadata("design:type", Array)
], WorkoutActivity.prototype, "posts", void 0);
__decorate([
    ManyToMany("Post", "workoutActivities"),
    __metadata("design:type", Array)
], WorkoutActivity.prototype, "linkedPosts", void 0);
WorkoutActivity = __decorate([
    Entity({ name: "workout_activities" })
], WorkoutActivity);
export { WorkoutActivity };
//# sourceMappingURL=workout-activity.js.map