import {HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma.service.js";
import {Days, TrainingsDay} from "./dto/user.dto.js";
import {TrainingDay} from "../generated/prisma/enums.js";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async addTrainings(trainings: Days, sub: string) {
        try {
            const dayMap: Record<keyof Days, TrainingDay> = {
                Monday: TrainingDay.MONDAY,
                Tuesday: TrainingDay.TUESDAY,
                Wednesday: TrainingDay.WEDNESDAY,
                Thursday: TrainingDay.THURSDAY,
                Friday: TrainingDay.FRIDAY,
                Saturday: TrainingDay.SATURDAY,
                Sunday: TrainingDay.SUNDAY,
            };

            const days = (Object.keys(dayMap) as (keyof TrainingsDay)[])
                .filter(day => trainings[day])
                .map(day => dayMap[day]);

            await this.prisma.trainings.create({
                data: {
                    days,
                    userId: sub
                }
            })

            return { status: 200 }
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }

    async setupComplete(id: string) {
        try {
            await this.prisma.users.update({
                where: { id },
                data: {
                    isSetUp: true
                }
            });

            return { status: HttpStatus.OK }
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message }
        }
    }

    async checkSetup(id: string) {
        try {
            const isSetupComplete = await this.prisma.users.findUnique({
                where: { id },
                select: {
                    isSetUp: true
                }
            });

            return {
                status: HttpStatus.OK,
                setup: isSetupComplete?.isSetUp ?? false,
            };
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }
}
