describe('AI Analysis Service', () => {
    let generateAIInsights: any;
    let generateAdvancedAIInsights: any;

    beforeEach(() => {
        jest.resetModules();

        const aiAnalysisModule = require('../ai-analysis');
        generateAIInsights = aiAnalysisModule.generateAIInsights;
        generateAdvancedAIInsights = aiAnalysisModule.generateAdvancedAIInsights;
    });

    describe('generateAIInsights', () => {
        it('should generate insights for football match', async () => {
            const input = {
                sport: 'Football',
                content: 'Great defensive performance with strong pressing',
                formation: {
                    home: { formation: ['4', '3', '3'] },
                    away: { formation: ['4', '2', '3', '1'] },
                },
                statistics: {
                    possession: { home: 65, away: 35 },
                    shots: { home: 15, away: 8 },
                    passes: { home: 520, away: 310 },
                },
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('AI Analysis for Football');
            expect(result).toContain('Formation Analysis');
            expect(result).toContain('4-3-3');
            expect(result).toContain('Statistical Insights');
            expect(result).toContain('dominated possession');
        });

        it('should identify tactical themes from content', async () => {
            const input = {
                sport: 'Soccer',
                content: 'Excellent defensive organization with effective pressing and counter-attacking',
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('defensive organization');
            expect(result).toContain('pressing strategy');
            expect(result).toContain('counter-attacking');
        });

        it('should analyze tactical patterns', async () => {
            const input = {
                sport: 'Football',
                content: 'Match analysis',
                tacticalPatterns: [
                    {
                        name: 'High Press',
                        type: 'Defensive',
                        description: 'Team applies pressure in opposition half',
                    },
                    {
                        name: 'Wing Play',
                        type: 'Offensive',
                        description: 'Utilizes width through wingers',
                    },
                ],
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('Tactical Patterns Identified');
            expect(result).toContain('High Press');
            expect(result).toContain('Wing Play');
        });

        it('should handle balanced possession statistics', async () => {
            const input = {
                sport: 'Football',
                content: 'Even match',
                statistics: {
                    possession: { home: 50, away: 50 },
                },
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('Balanced possession');
            expect(result).toContain('evenly matched');
        });

        it('should include recommendations', async () => {
            const input = {
                sport: 'Football',
                content: 'Analysis',
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('Recommendations');
            expect(result).toContain('pressing triggers');
        });

        it('should handle errors gracefully', async () => {
            const input = null as any;

            const result = await generateAIInsights(input);

            expect(result).toContain('Unable to generate AI insights');
        });

        it('should analyze formation with 4-2-3-1', async () => {
            const input = {
                sport: 'Football',
                content: 'Match analysis',
                formation: {
                    home: { formation: ['4', '2', '3', '1'] },
                    away: { formation: ['4', '4', '2'] },
                },
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('4-2-3-1');
            expect(result).toContain('defensive stability');
        });

        it('should handle missing optional parameters', async () => {
            const input = {
                sport: 'Basketball',
                content: 'Great game',
            };

            const result = await generateAIInsights(input);

            expect(result).toContain('AI Analysis for Basketball');
            expect(result).toBeDefined();
        });
    });

    describe('generateAdvancedAIInsights', () => {
        it('should return placeholder message', async () => {
            const input = {
                sport: 'Football',
                content: 'Test',
            };

            const result = await generateAdvancedAIInsights(input);

            expect(result).toContain('Advanced AI insights coming soon');
        });
    });
});
