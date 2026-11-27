import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../guards/auth.guard.js';
import { MonitoringService } from './monitoring.service.js';

@Controller('monitoring')
export class MonitoringController {
  constructor(
      private readonly monitoringService: MonitoringService,
      private readonly jwt: JwtService,
  ) {}

  @Get('results')
  @UseGuards(AuthGuard)
  async getResults(@Req() req: Request) {
    const token: unknown = req.cookies?.['access_token'];

    if (typeof token !== 'string') {
      throw new UnauthorizedException('Access token is missing');
    }

    let userId: string;

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }

    if (!userId) {
      throw new UnauthorizedException('User ID is missing from access token');
    }

    try {
      return await this.monitoringService.getResults(userId);
    } catch {
      throw new InternalServerErrorException('Could not load monitoring data');
    }
  }
}