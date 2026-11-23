import {BadRequestException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma.service.js";
import {CreateNotificationDto} from "./dto/notifications.dto.js";
import {TrainingDay} from "../generated/prisma/enums.js";

const TRAINING_REMINDER_TITLE = "Hey! It's Seems Like You Have Training Today!";

function localDateKey(date: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const get = (type: string) => parts.find(part => part.type === type)?.value;

    return `${get("year")}-${get("month")}-${get("day")}`;
}

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) {}

    async get(id: string) {
        try {
            const notifications = await this.prisma.notifications.findMany({
                where: { userId: id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return { status: HttpStatus.OK, notifications };
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }

    async create(body: CreateNotificationDto, id: string) {
        const { title, description } = body;

        try {
            await this.prisma.notifications.create({
                data: {
                    title,
                    description,
                    userId: id
                }
            });

            return { status: HttpStatus.OK }
        } catch (e) {
            return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: e.message };
        }
    }

    async checkTraining(userId: string, timeZone: string ) {
        let weekday: string;

        try {
            weekday = new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                timeZone,
            }).format(new Date());
        } catch {
            throw new BadRequestException("Invalid time zone");
        }

        const dayMap: Record<string, TrainingDay> = {
            Monday: TrainingDay.MONDAY,
            Tuesday: TrainingDay.TUESDAY,
            Wednesday: TrainingDay.WEDNESDAY,
            Thursday: TrainingDay.THURSDAY,
            Friday: TrainingDay.FRIDAY,
            Saturday: TrainingDay.SATURDAY,
            Sunday: TrainingDay.SUNDAY,
        };

        const schedule = await this.prisma.trainings.findUnique({
            where: { userId },
            select: { days: true },
        });

        const isTraining = schedule?.days.includes(dayMap[weekday]) ?? false;

        if (!isTraining) {
            return { status: 200, isTraining: false, reminderExists: false };
        }

        const lastReminder = await this.prisma.notifications.findFirst({
            where: { userId, title: TRAINING_REMINDER_TITLE },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        });

        const reminderExists = lastReminder
            ? localDateKey(lastReminder.createdAt, timeZone) === localDateKey(new Date(), timeZone)
            : false;

        return { status: 200, isTraining, reminderExists };
    }
}
