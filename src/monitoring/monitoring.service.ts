import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

type RaceResult = {
    id: string;
    event: string;
    date: string;
    distance: string;
    time: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTime(value: string): number | null {
    const parts = value.trim().split(':');

    if (
        parts.length < 1 ||
        parts.length > 3 ||
        parts.some(part => !/^\d+(?:\.\d+)?$/.test(part))
    ) {
        return null;
    }

    const numbers = parts.map(Number);

    if (numbers.slice(1).some(part => part >= 60)) {
        return null;
    }

    return numbers.reduce((total, part) => total * 60 + part, 0);
}

@Injectable()
export class MonitoringService {
    constructor(private readonly prisma: PrismaService) {}

    async getResults(userId: string) {
        const [competitions, workoutCount, recentWorkouts, trainingSchedule] =
            await Promise.all([
                this.prisma.competitions.findMany({
                    where: { userId },
                    select: {
                        id: true,
                        name: true,
                        date: true,
                        distances: true,
                    },
                    orderBy: { date: 'asc' },
                }),
                this.prisma.workouts.count({ where: { userId } }),
                this.prisma.workouts.findMany({
                    where: { userId },
                    select: {
                        id: true,
                        trainingDescription: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                }),
                this.prisma.trainings.findUnique({
                    where: { userId },
                    select: { days: true },
                }),
            ]);

        const results: RaceResult[] = [];

        for (const competition of competitions) {
            if (!Array.isArray(competition.distances)) continue;

            competition.distances.forEach((value, index) => {
                if (!isObject(value)) return;

                const distance = value.distance;
                const time = value.time;

                const date = new Date(competition.date);

                if (
                    typeof distance !== 'string' ||
                    !distance.trim() ||
                    typeof time !== 'string' ||
                    !time.trim() ||
                    parseTime(time) === null ||
                    !Number.isFinite(date.getTime())
                ) {
                    return;
                }

                results.push({
                    id: `${competition.id}-${index}`,
                    event: competition.name,
                    date: competition.date,
                    distance,
                    time,
                });
            });
        }

        const today = new Date().toISOString().slice(0, 10);
        const upcomingCompetitions = competitions.filter(item => item.date >= today).length;

        const bestByDistance = new Map<string, RaceResult>();

        for (const result of results) {
            const seconds = parseTime(result.time);
            if (seconds === null) continue;

            const currentBest = bestByDistance.get(result.distance);
            if (!currentBest || seconds < parseTime(currentBest.time)!) {
                bestByDistance.set(result.distance, result);
            }
        }

        return {
            results,
            summary: {
                competitionCount: competitions.length,
                upcomingCompetitionCount: upcomingCompetitions,
                endedCompetitionCount: competitions.length - upcomingCompetitions,
                workoutCount,
                raceResultCount: results.length,
                scheduledTrainingDays: trainingSchedule?.days ?? [],
                personalBests: [...bestByDistance.values()],
            },
            recentWorkouts: recentWorkouts.map(workout => ({
                id: workout.id,
                description: workout.trainingDescription,
                createdAt: workout.createdAt,
            })),
        };
    }
}