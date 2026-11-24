import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException, Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service.js';
import {AuthGuard} from "../guards/auth.guard.js";
import type { Request } from 'express';
import {JwtService} from "@nestjs/jwt";
import type {WorkoutsDto} from "./(dto)/workouts.dto.js";

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService,
              private readonly jwt: JwtService) {}

  @Get('get')
  @UseGuards(AuthGuard)
  async get(@Req() req: Request) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.workoutsService.get(payload.sub);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(`Cannot get your trainings: ${response.message}`);
      } else {
        return { status: HttpStatus.OK, trainings: response.trainings };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Req() req: Request, @Body() body: WorkoutsDto) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.workoutsService.create(payload.sub, body);

      if(!response || response.status !== 200){
        throw new InternalServerErrorException(response.message);
      } else {
        return { status: HttpStatus.OK, trainings: response.trainings };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
