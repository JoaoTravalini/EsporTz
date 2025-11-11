import { z } from 'zod';

export const highlightSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
    sportId: z.string().uuid("Invalid sport ID"),
    tags: z.array(z.string().max(50, "Tag must be less than 50 characters")).optional(),
    metadata: z.object({
        matchInfo: z.object({
            teams: z.array(z.string()),
            score: z.string(),
            date: z.date(),
            competition: z.string()
        }).optional(),
        playerStats: z.any().optional(),
        performance: z.any().optional()
    }).optional(),
    isPublic: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    duration: z.number().min(0).optional()
});

export type HighlightInput = z.infer<typeof highlightSchema>;

export function validateHighlight(data: unknown):
    | { success: true; data: HighlightInput }
    | { success: false; error: string } {
    const result = highlightSchema.safeParse(data);

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