import { AppDataSource } from "../database/postgres/data-source.js";
import { RefreshToken } from "../database/postgres/entities/refresh-token.js";
import { WorkoutActivity, WorkoutType } from "../database/postgres/entities/workout-activity.js";
import { refreshStravaAccessToken } from "./strava-token-service.js";
const workoutActivityRepository = AppDataSource.getRepository(WorkoutActivity);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const STRAVA_PROVIDER = "strava";
const mapStravaTypeToWorkoutType = (stravaType) => {
    const typeMap = {
        'Run': WorkoutType.RUN,
        'Ride': WorkoutType.RIDE,
        'Swim': WorkoutType.SWIM,
        'Workout': WorkoutType.WORKOUT,
        'Walk': WorkoutType.WALK,
        'Hike': WorkoutType.HIKE,
        'AlpineSki': WorkoutType.ALPINESKI,
        'BackcountrySki': WorkoutType.BACKCOUNTRYSKI,
        'NordicSki': WorkoutType.NORDICSKI,
        'Snowboard': WorkoutType.SNOWBOARD,
        'Kayaking': WorkoutType.KAYAKING,
        'EBikeRide': WorkoutType.EBIKERIDE,
        'VirtualRide': WorkoutType.VIRTUALRIDE
    };
    return typeMap[stravaType] || WorkoutType.WORKOUT;
};
const convertStravaActivityToWorkoutActivity = (stravaActivity, athleteId, userId) => {
    return {
        stravaId: stravaActivity.id.toString(),
        athleteId,
        userId: userId,
        name: stravaActivity.name,
        type: mapStravaTypeToWorkoutType(stravaActivity.type),
        sportType: stravaActivity.sport_type,
        startDate: new Date(stravaActivity.start_date),
        endDate: new Date(stravaActivity.start_date_local),
        distance: stravaActivity.distance,
        movingTime: stravaActivity.moving_time,
        elapsedTime: stravaActivity.elapsed_time,
        averageSpeed: stravaActivity.average_speed,
        maxSpeed: stravaActivity.max_speed,
        averageHeartRate: stravaActivity.average_heartrate,
        maxHeartRate: stravaActivity.max_heartrate,
        averageCadence: stravaActivity.average_cadence,
        averagePower: stravaActivity.average_watts,
        maxPower: stravaActivity.max_watts,
        elevationGain: stravaActivity.total_elevation_gain,
        elevationHigh: stravaActivity.elev_high,
        elevationLow: stravaActivity.elev_low,
        polyline: stravaActivity.map?.summary_polyline,
        description: stravaActivity.description,
        rawStravaData: stravaActivity,
        isPrivate: stravaActivity.private || false,
        hasKudo: (stravaActivity.kudos_count || 0) > 0,
        kudosCount: stravaActivity.kudos_count,
        commentCount: stravaActivity.comment_count,
        photoCount: stravaActivity.photo_count,
        lastSyncAt: new Date()
    };
};
export const getAthleteStravaActivities = async (athleteId, page = 1, perPage = 30, before, after) => {
    // Buscar token de acesso atualizado
    const tokenRecord = await refreshTokenRepository.findOne({
        where: {
            provider: STRAVA_PROVIDER,
            providerUserId: athleteId
        }
    });
    if (!tokenRecord) {
        throw new Error(`No Strava token found for athlete ${athleteId}`);
    }
    // Verificar se o token está expirado e precisa ser renovado
    let accessToken = tokenRecord.accessToken;
    const now = new Date();
    const expiresAt = tokenRecord.accessTokenExpiresAt;
    // Renovar token se estiver expirado ou próximo de expirar (5min de margem)
    if (expiresAt && now >= new Date(expiresAt.getTime() - 5 * 60 * 1000)) {
        const refreshResult = await refreshStravaAccessToken({ providerUserId: athleteId });
        if (refreshResult) {
            accessToken = refreshResult.token.accessToken;
        }
        else {
            throw new Error(`Failed to refresh Strava token for athlete ${athleteId}`);
        }
    }
    // Construir URL da API do Strava
    const baseUrl = "https://www.strava.com/api/v3/athlete/activities";
    const url = new URL(baseUrl);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('per_page', perPage.toString());
    if (before) {
        url.searchParams.append('before', Math.floor(before.getTime() / 1000).toString());
    }
    if (after) {
        url.searchParams.append('after', Math.floor(after.getTime() / 1000).toString());
    }
    // Fazer requisição para a API do Strava
    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch Strava activities: ${response.status} ${errorText}`);
    }
    const activities = await response.json();
    return {
        activities,
        hasMore: activities.length === perPage,
        total: activities.length
    };
};
export const syncAthleteActivities = async (athleteId, userId, limit = 50) => {
    const syncedActivities = [];
    let page = 1;
    let hasMore = true;
    while (hasMore && syncedActivities.length < limit) {
        const remaining = limit - syncedActivities.length;
        const perPage = Math.min(30, remaining);
        const response = await getAthleteStravaActivities(athleteId, page, perPage);
        for (const stravaActivity of response.activities) {
            // Verificar se atividade já existe
            const existingActivity = await workoutActivityRepository.findOne({
                where: { stravaId: stravaActivity.id.toString() }
            });
            const activityData = convertStravaActivityToWorkoutActivity(stravaActivity, athleteId, userId);
            let savedActivity;
            if (existingActivity) {
                // Atualizar atividade existente
                workoutActivityRepository.merge(existingActivity, activityData);
                savedActivity = await workoutActivityRepository.save(existingActivity);
            }
            else {
                // Criar nova atividade
                const newActivity = workoutActivityRepository.create(activityData);
                savedActivity = await workoutActivityRepository.save(newActivity);
            }
            syncedActivities.push(savedActivity);
        }
        hasMore = response.hasMore && response.activities.length > 0;
        page++;
    }
    return syncedActivities;
};
export const getUserActivities = async (userId, limit = 10, offset = 0) => {
    return await workoutActivityRepository.find({
        where: { userId },
        order: { startDate: 'DESC' },
        take: limit,
        skip: offset
    });
};
export const getActivityById = async (activityId) => {
    return await workoutActivityRepository.findOne({
        where: { id: activityId },
        relations: ['posts']
    });
};
export const getActivitiesByIds = async (activityIds) => {
    return await workoutActivityRepository.findByIds(activityIds);
};
//# sourceMappingURL=strava-activities-service.js.map