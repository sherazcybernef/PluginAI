import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScanKind } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SiteOwnerGuard } from '../common/guards/site-owner.guard';
import { SitesService } from './sites.service';
import { ScansService } from '../scans/scans.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesOpsController {
  constructor(
    private readonly sites: SitesService,
    private readonly scans: ScansService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':siteId/scans')
  @UseGuards(SiteOwnerGuard)
  enqueueScan(
    @Param('siteId') siteId: string,
    @Query('kind', new DefaultValuePipe('full'), new ParseEnumPipe(ScanKind))
    kind: ScanKind,
  ) {
    return this.scans.enqueue(siteId, kind);
  }

  @Get(':siteId/issues')
  @UseGuards(SiteOwnerGuard)
  async issues(
    @Param('siteId') siteId: string,
    @Query('scanId') scanId?: string,
  ) {
    let scan =
      scanId != null
        ? await this.prisma.scan.findFirst({
            where: { id: scanId, siteId, status: 'COMPLETED' },
          })
        : await this.sites.latestCompletedScan(siteId);

    if (!scan) {
      return { issues: [], scan: null };
    }

    const issues = await this.prisma.issue.findMany({
      where: { scanId: scan.id },
      orderBy: [{ pillar: 'asc' }, { issueType: 'asc' }],
    });

    return { scanId: scan.id, issues };
  }

  @Get(':siteId/scores/latest')
  @UseGuards(SiteOwnerGuard)
  async latestScore(@Param('siteId') siteId: string) {
    const scan = await this.sites.latestCompletedScan(siteId);
    if (!scan) {
      return { score: null, scan: null };
    }
    const score = await this.prisma.scoreSnapshot.findUnique({
      where: { scanId: scan.id },
    });
    return { score, scan };
  }

  @Get(':siteId/scores')
  @UseGuards(SiteOwnerGuard)
  async scoreHistory(@Param('siteId') siteId: string) {
    const scans = await this.prisma.scan.findMany({
      where: { siteId, status: 'COMPLETED' },
      orderBy: { finishedAt: 'desc' },
      take: 24,
      include: { score: true },
    });
    return scans.map((s) => ({
      scanId: s.id,
      finishedAt: s.finishedAt,
      score: s.score,
    }));
  }
}
