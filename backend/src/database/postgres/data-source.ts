import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Post } from "./entities/post-entity.js";
import { User } from "./entities/user-entity.js";
import { Like } from "./entities/like-entity.js";
import { RefreshToken } from "./entities/refresh-token.js";
import { Group } from "./entities/group-entity.js";
import { Highlight } from "./entities/Highlight.js";
import { Sport } from "./entities/Sport.js";
import { TacticalAnalysis } from "./entities/TacticalAnalysis.js";
import { TacticalComment } from "./entities/TacticalComment.js";
import { Team } from "./entities/Team.js";
import { Match } from "./entities/Match.js";
import { MatchEvent } from "./entities/MatchEvent.js";
import { WorkoutActivity } from "./entities/workout-activity.js";
import { PostWorkoutActivity } from "./entities/post-workout-activity.js";
import { Hashtag } from "./entities/hashtag-entity.js";

dotenv.config();

const databaseUrl = process.env.POSTGRES_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const AppDataSource = new DataSource({
  type: "cockroachdb",
  url: databaseUrl,
  ssl: true,
  synchronize: false,
  entities: [
    Like,
    Post,
    User,
    RefreshToken,
    Group,
    Highlight,
    Sport,
    TacticalAnalysis,
    TacticalComment,
    Team,
    Match,
    MatchEvent,
    WorkoutActivity,
    PostWorkoutActivity,
    Hashtag
  ],
  migrations: ["src/database/postgres/migrations/*.ts"],
  migrationsTableName: "migrations",
  timeTravelQueries: false
});