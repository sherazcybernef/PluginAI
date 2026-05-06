import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { ScansService } from './scans.service';

@Controller('scans')
@UseGuards(JwtAuthGuard)
export class ScansController {
  constructor(private readonly scans: ScansService) {}

  @Get(':scanId')
  getOne(@Param('scanId') scanId: string, @CurrentUser() user: JwtPayload) {
    return this.scans.getForUser(scanId, user.sub);
  }
}
