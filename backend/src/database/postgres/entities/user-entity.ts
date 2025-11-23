import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import * as bcrypt from "bcrypt";
import type { Post } from "./post-entity.js";
import type { Like } from "./like-entity.js";
import type { Highlight } from "./Highlight.js";
import type { TacticalAnalysis } from "./TacticalAnalysis.js";
import type { TacticalComment } from "./TacticalComment.js";
import type { Team } from "./Team.js";
import type { Match } from "./Match.js";
import type { Group } from "./group-entity.js";
import type { Mention } from "./mention-entity.js";
import type { Notification } from "./notification-entity.js";

@Entity() 
export class User extends BaseEntity  {
  
    @Column({ type: "string" })
    name!:string;

    @Column({ type: "string", unique: true })
    email!:string;

    @Column({ type: "string" })
    password!:string;

    @Column({ type: "string", nullable: true })
    imgURL!:string | null;

    @Column({ type: "string" })
    provider!:string;

    @Column({ type: "text", nullable: true })
    bio!:string | null;

    @Column({ type: "string", nullable: true })
    location!:string | null;

    @Column({ type: "string", nullable: true })
    website!:string | null;

    @BeforeInsert()
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    @OneToMany("Post","author")
    posts!:Post[];

    @OneToMany("Like","user")
    likes!:Like[];
    
    @ManyToMany("Post","repostedBy")
    @JoinTable({ name: 'user_reposts' })
    reposts!: Post[];

    @ManyToMany("User","followers")
    @JoinTable({
        name: 'user_following',
        joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'followed_id', referencedColumnName: 'id' }
    })
    following!: User[];

    @ManyToMany("User","following")
    followers!: User[];

    // New relationships for sports features
    @OneToMany("Highlight","author")
    highlights!: Highlight[];

    @OneToMany("TacticalAnalysis","author")
    tacticalAnalyses!: TacticalAnalysis[];

    @OneToMany("TacticalComment","author")
    tacticalComments!: TacticalComment[];

    @ManyToMany("Team","fans")
    @JoinTable({
        name: 'user_favorite_teams',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'team_id', referencedColumnName: 'id' }
    })
    favoriteTeams!: Team[];

    @ManyToMany("Match","followers")
    @JoinTable({
        name: 'user_followed_matches',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'match_id', referencedColumnName: 'id' }
    })
    followedMatches!: Match[];

    @ManyToMany("Group", "members")
    groups!: Group[];

    @OneToMany("Group", "owner")
    ownedGroups!: Group[];

    @Column({ type: "json", nullable: true })
    preferences!: {
        favoriteSports: string[];
        notifications: {
            highlights: boolean;
            analyses: boolean;
            matches: boolean;
            followedTeams: boolean;
        };
        privacy: {
            profilePublic: boolean;
            showStats: boolean;
            allowAnalysisSharing: boolean;
        };
    };

    @Column({ type: "json", nullable: true })
    stats!: {
        highlightsCreated: number;
        analysesCreated: number;
        totalViews: number;
        totalLikes: number;
        favoriteSport?: string;
    };

    // Menções recebidas
    @OneToMany("Mention", "mentionedUser")
    mentions!: Mention[];

    // Notificações recebidas
    @OneToMany("Notification", "recipient")
    notifications!: Notification[];

    // Notificações onde o usuário é o ator
    @OneToMany("Notification", "actor")
    actorNotifications!: Notification[];
}