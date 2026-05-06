import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  list(workspaceId: string) {
    return this.prisma.site.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(workspaceId: string, dto: CreateSiteDto) {
    return this.prisma.site.create({
      data: {
        workspaceId,
        url: dto.url.replace(/\/+$/, ''),
        platform: dto.platform,
        name: dto.name,
        verified: true,
      },
    });
  }

  async latestCompletedScan(siteId: string) {
    return this.prisma.scan.findFirst({
      where: { siteId, status: 'COMPLETED' },
      orderBy: { finishedAt: 'desc' },
    });
  }
}
