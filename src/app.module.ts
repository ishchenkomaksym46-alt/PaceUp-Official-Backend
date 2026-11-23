import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {PrismaService} from "./prisma.service.js";
import {AuthModule} from "./auth/auth.module.js";
import { UserModule } from './user/user.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
