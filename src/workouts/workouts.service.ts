import {HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma.service.js";
import {WorkoutsDto} from "./(dto)/workouts.dto.js";

@Injectable()
export class WorkoutsService {
    constructor(private readonly prisma: PrismaService) {}

    async get(userId: string) {
        try {
            const trainings = await this.prisma.workouts.findMany({
                where: { userId },
                select: {
                    id: true,
                    trainingDescription: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return { status: HttpStatus.OK, trainings };
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }

    async create(userId: string, body: WorkoutsDto) {
        const { trainingDescription } = body

        try {
             await this.prisma.workouts.create({
                data: {
                    trainingDescription,
                    userId
                }
            });

            const trainings = await this.prisma.workouts.findMany({
                where: { userId },
                select: {
                    id: true,
                    trainingDescription: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return { status: HttpStatus.OK, trainings };
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }
}
