import {HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma.service.js";
import {RacesDto} from "./dto/races.dto.js";

function getCompetitionType(date: string): 'Ended' | 'Upcoming' {
    const today = new Date().toISOString().slice(0, 10);
    return date < today ? 'Ended' : 'Upcoming';
}

@Injectable()
export class RacesService {
    constructor(private readonly prisma: PrismaService) {}

    async get(userId: string) {
        try {
            const competitions = await this.prisma.competitions.findMany({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    distances: true,
                    date: true,
                    type: true,
                    createdAt: true,
                },
                orderBy: {
                    date: 'desc'
                }
            });

            return { status: 200, competitions: competitions.map(competition => ({
                    ...competition,
                    type: getCompetitionType(competition.date),
                })),
            };
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }

    async create(userId: string, body: RacesDto) {
        const { competitionName, distances, date} = body;

        try {
            const response = await this.prisma.competitions.create({
                data: {
                    name: competitionName,
                    distances,
                    date,
                    type: getCompetitionType(date),
                    userId
                }
            });

            const competitions = await this.prisma.competitions.findMany({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    date: true,
                    type: true,
                    distances: true,
                    createdAt: true
                },
                orderBy: {
                    date: 'desc'
                }
            });

            return { status: HttpStatus.CREATED, competitions };
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }
}
