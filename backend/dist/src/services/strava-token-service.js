import { AppDataSource } from "../database/postgres/data-source.js";
import { RefreshToken } from "../database/postgres/entities/refresh-token.js";
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const STRAVA_PROVIDER = "strava";
export const upsertStravaToken = async (payload) => {
    const providerUserId = payload.athlete?.id?.toString();
    if (!providerUserId) {
        throw new Error("Strava token payload does not include athlete id");
    }
    const expiresAt = new Date(payload.expires_at * 1000);
    const existing = await refreshTokenRepository.findOne({
        where: {
            provider: STRAVA_PROVIDER,
            providerUserId
        }
    });
    const entity = existing
        ? refreshTokenRepository.merge(existing, {
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            accessTokenExpiresAt: expiresAt
        })
        : refreshTokenRepository.create({
            provider: STRAVA_PROVIDER,
            providerUserId,
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            accessTokenExpiresAt: expiresAt
        });
    const saved = await refreshTokenRepository.save(entity);
    return { token: saved, raw: payload };
};
export const refreshStravaAccessToken = async ({ providerUserId }) => {
    const record = await refreshTokenRepository.findOne({
        where: {
            provider: STRAVA_PROVIDER,
            providerUserId
        }
    });
    if (!record) {
        return undefined;
    }
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_SECRET_CLIENT;
    if (!clientId || !clientSecret) {
        throw new Error("Strava credentials are not configured");
    }
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: record.refreshToken
    });
    const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });
    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(`Failed to refresh Strava token: ${JSON.stringify(errorPayload)}`);
    }
    const payload = (await response.json());
    const { token } = await upsertStravaToken(payload);
    return { token, raw: payload };
};
//# sourceMappingURL=strava-token-service.js.map