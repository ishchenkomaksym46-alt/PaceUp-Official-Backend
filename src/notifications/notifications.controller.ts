import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException, Post,
  Req, Res,
  UseGuards
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import {AuthGuard} from "../guards/auth.guard.js";
import type { Request } from 'express';
import {JwtService} from "@nestjs/jwt";
import type {CreateNotificationDto} from "./dto/notifications.dto.js";

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService,
              private readonly jwt: JwtService ) {}

  @Get('get')
  @UseGuards(AuthGuard)
  async get(@Req() req: Request) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.notificationsService.get(payload.sub);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(response.message);
      } else {
        return { status: HttpStatus.OK, data: response.notifications };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Body() body: CreateNotificationDto, @Req() req: Request) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.notificationsService.create(body, payload.sub);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(response.message);
      } else {
        return { status: HttpStatus.OK };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('check-training')
  @UseGuards(AuthGuard)
  async checkTraining(@Req() req: Request, @Body() body: { timeZone: string }) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
        const response = await this.notificationsService.checkTraining(payload.sub, body.timeZone);

        if(!response || response.status !== 200){
          throw new InternalServerErrorException('Cannot add new reminder');
        } else if(response.isTraining) {
          if (response.reminderExists) {
            return { status: 200, isTraining: true, reminderCreated: false };
          }

          return this.notificationsService.create({
            title: "Hey! It's Seems Like You Have Training Today!",
            description: "Don't Miss Your Training! And Remember - Always Work Hard!"
          }, payload.sub);
        } else {
          return { status: 200, isTraining: false };
        }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
