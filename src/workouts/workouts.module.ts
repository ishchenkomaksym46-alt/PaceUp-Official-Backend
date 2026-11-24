import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service.js';
import { WorkoutsController } from './workouts.controller.js';
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {PrismaService} from "../prisma.service.js";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, PrismaService],
})
export class WorkoutsModule {}
