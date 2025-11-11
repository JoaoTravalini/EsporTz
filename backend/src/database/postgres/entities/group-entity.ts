import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { BaseEntity } from "./base-entity.js";
import type { User } from "./user-entity.js";

@Entity()
export class Group extends BaseEntity {
    @Column({ type: "string" })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "string", nullable: true })
    imgURL!: string | null;

    @Column({ type: "string", unique: true })
    slug!: string;

    @Column({ type: "string", default: "public" })
    privacy!: "public" | "private" | "invite_only";

    @ManyToMany("User", "groups")
    @JoinTable({
        name: 'group_members',
        joinColumn: { name: 'group_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
    })
    members!: User[];

    @ManyToOne("User", "ownedGroups")
    owner!: User;

    @Column({ type: "json", nullable: true })
    settings!: {
        allowMemberInvites: boolean;
        requireApproval: boolean;
        maxMembers?: number;
    } | null;
}