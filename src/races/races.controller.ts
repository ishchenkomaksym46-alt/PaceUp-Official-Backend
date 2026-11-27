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
import { RacesService } from './races.service.js';
import {AuthGuard} from "../guards/auth.guard.js";
import type { Request } from "express";
import {JwtService} from "@nestjs/jwt";
import type {RacesDto} from "./dto/races.dto.js";

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService,
              private readonly jwt: JwtService,) {}

  @Get('get')
  @UseGuards(AuthGuard)
  async get(@Req() req: Request) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.racesService.get(payload.sub);

      if(!response || response.status !== 200) {
        throw new InternalServerErrorException(response.message);
      } else {
        return { status: HttpStatus.OK, competitions: response.competitions }
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('create')
  @UseGuards(AuthGuard)
  async create(@Req() req: Request, @Body() body: RacesDto) {
    const accessToken = await req.cookies['access_token'];

    if(!accessToken){
      throw new NotFoundException("Access Token Not Found!");
    }

    const payload = await this.jwt.verifyAsync<{ sub: string }>(accessToken);

    try {
      const response = await this.racesService.create(payload.sub, body);

      if(!response || response.status !== 201) {
        return { status: response.status, message: response.message };
      } else {
        return { status: HttpStatus.OK, competitions: response.competitions }
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
