import { Module } from '@nestjs/common';
import { RacesService } from './races.service.js';
import { RacesController } from './races.controller.js';
import {PrismaService} from "../prisma.service.js";
import {ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RacesController],
  providers: [RacesService, PrismaService],
})
export class RacesModule {}
