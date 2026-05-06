import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ScanKind } from '@prisma/client';
import { ScanRunnerService } from './scan-runner.service';

function useRedisQueue(): boolean {
  return process.env.SYNC_SCANS !== '1';
}

@Injectable()
export class ScansService {
  constructor(
    @Optional() @InjectQueue('scans') private readonly scansQueue: Queue | null,
    private readonly prisma: PrismaService,
    private readonly scanRunner: ScanRunnerService,
  ) {}

  async enqueue(siteId: string, kind: ScanKind = ScanKind.full) {
    const scan = await this.prisma.scan.create({
      data: {
        siteId,
        kind,
        status: 'QUEUED',
      },
    });

    if (!useRedisQueue() || !this.scansQueue) {
      await this.scanRunner.execute(scan.id);
    } else {
      await this.scansQueue.add(
        'run',
        { scanId: scan.id },
        {
          jobId: scan.id,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    const fresh = await this.prisma.scan.findUnique({ where: { id: scan.id } });

    return {
      scan: fresh ?? scan,
      quota_remaining: null as number | null,
    };
  }

  async getForUser(scanId: string, ownerId: string) {
    const scan = await this.prisma.scan.findFirst({
      where: {
        id: scanId,
        site: { workspace: { ownerId } },
      },
      include: {
        issues: { orderBy: [{ severity: 'desc' }] },
        score: true,
        site: { select: { id: true, url: true, platform: true } },
      },
    });
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }
    return scan;
  }
}
