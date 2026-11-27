import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service.js';
import { MonitoringController } from './monitoring.controller.js';
import {PrismaService} from "../prisma.service.js";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService, PrismaService],
})
export class MonitoringModule {}
