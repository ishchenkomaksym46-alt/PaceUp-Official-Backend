import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {PrismaService} from "./prisma.service.js";
import {AuthModule} from "./auth/auth.module.js";
import { UserModule } from './user/user.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { WorkoutsModule } from './workouts/workouts.module.js';
import { RacesModule } from './races/races.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    NotificationsModule,
    WorkoutsModule,
    RacesModule,
    MonitoringModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
