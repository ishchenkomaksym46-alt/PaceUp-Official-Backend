import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException, Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service.js';
import {AuthGuard} from "../guards/auth.guard.js";
import type { Request } from "express";
import {JwtService} from "@nestjs/jwt";
import type {TrainingsDay} from "./dto/user.dto.js";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
              private readonly jwt: JwtService) {}

  @Get('get-user')
  @UseGuards(AuthGuard)
  async getUser(@Req() req: Request) {
    try {
      const accessToken = req.cookies['access_token']

      if(!accessToken){
        throw new NotFoundException('Access token not found')
      }

      const payload = await this.jwt.verifyAsync<{ username: string }>(accessToken);

      console.log(payload);

      return { status: HttpStatus.OK, payload }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('add-trainings')
  @UseGuards(AuthGuard)
  async addTrainings(@Body() body: TrainingsDay, @Req() req: Request) {
    const { trainings } = body;
    const accessToken = await req.cookies['access_token']

    if(!accessToken){
      throw new NotFoundException('Access token not found')
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.userService.addTrainings(trainings, payload.sub);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(response.message);
      } else {
        return { status: HttpStatus.CREATED };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('setup-complete')
  @UseGuards(AuthGuard)
  async setupComplete(@Req() req: Request) {
    const accessToken = await req.cookies['access_token']

    if(!accessToken){
      throw new NotFoundException('Access token not found')
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.userService.setupComplete(payload.sub);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(response.message);
      } else {
        return { status: HttpStatus.CREATED };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('check-setup')
  @UseGuards(AuthGuard)
  async checkSetup(@Req() req: Request) {
    const accessToken = await req.cookies['access_token']

    if(!accessToken){
      throw new NotFoundException('Access token not found')
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.userService.checkSetup(payload.sub);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(response.message);
      } else  {
        if(response.setup) {
          return { status: HttpStatus.OK, setup: true };
        } else {
          return { status: HttpStatus.OK, setup: false };
        }
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
