import { z } from 'zod';

const positionSchema = z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    player: z.string().optional(),
    role: z.string().optional()
});

const tacticalPatternSchema = z.object({
    name: z.string().min(1, "Pattern name is required"),
    description: z.string().min(1, "Pattern description is required"),
    type: z.enum(['offensive', 'defensive', 'transition']),
    positions: z.array(positionSchema)
});

const keyMomentSchema = z.object({
    timestamp: z.number().min(0),
    description: z.string().min(1, "Description is required"),
    type: z.enum(['goal', 'chance', 'save', 'tactical_change', 'substitution']),
    importance: z.enum(['low', 'medium', 'high', 'critical'])
});

const drawingDataSchema = z.object({
    type: z.enum(['arrow', 'circle', 'line', 'text']),
    coordinates: z.array(z.number()),
    color: z.string().optional(),
    size: z.number().optional()
});

export const tacticalAnalysisSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
    sportId: z.string().uuid("Invalid sport ID"),
    formation: z.object({
        home: z.object({
            formation: z.array(z.string()),
            positions: z.array(positionSchema)
        }),
        away: z.object({
            formation: z.array(z.string()),
            positions: z.array(positionSchema)
        })
    }).optional(),
    tacticalPatterns: z.array(tacticalPatternSchema).optional(),
    keyMoments: z.array(keyMomentSchema).optional(),
    statistics: z.object({
        possession: z.object({ home: z.number(), away: z.number() }).optional(),
        shots: z.object({ home: z.number(), away: z.number() }).optional(),
        passes: z.object({ home: z.number(), away: z.number() }).optional(),
        fouls: z.object({ home: z.number(), away: z.number() }).optional(),
        custom: z.record(z.string(), z.any()).optional()
    }).optional(),
    highlightId: z.string().uuid().optional(),
    matchId: z.string().uuid().optional(),
    isPublic: z.boolean().default(true)
});

export const tacticalCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(1000, "Comment must be less than 1000 characters"),
    timestamp: z.number().min(0).optional(),
    drawingData: z.array(drawingDataSchema).optional(),
    parentCommentId: z.string().uuid().optional()
});

export type TacticalAnalysisInput = z.infer<typeof tacticalAnalysisSchema>;
export type TacticalCommentInput = z.infer<typeof tacticalCommentSchema>;

export function validateTacticalAnalysis(data: unknown):
    | { success: true; data: TacticalAnalysisInput }
    | { success: false; error: string } {
    const result = tacticalAnalysisSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        };
    }

    return {
        success: true,
        data: result.data
    };
}

export function validateTacticalComment(data: unknown):
    | { success: true; data: TacticalCommentInput }
    | { success: false; error: string } {
    const result = tacticalCommentSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        };
    }

    return {
        success: true,
        data: result.data
    };
}