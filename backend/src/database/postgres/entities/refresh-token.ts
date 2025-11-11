import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "./base-entity.js";

@Entity({ name: "oauth_refresh_token" })
export class RefreshToken extends BaseEntity {
	@Column({ type: "string" })
	provider!: string;

	@Index()
	@Column({ type: "string" })
	providerUserId!: string;

	@Column({ type: "string" })
	accessToken!: string;

	@Column({ type: "string" })
	refreshToken!: string;

	@Column({ type: "timestamptz" })
	accessTokenExpiresAt!: Date;
}
