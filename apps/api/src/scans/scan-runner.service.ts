import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class ScanRunnerService {
  private readonly logger = new Logger(ScanRunnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: ScoringService,
  ) {}

  /** Runs scoring pipeline for one scan (used by Bull worker or synchronous local mode). */
  async execute(scanId: string): Promise<void> {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: { site: true },
    });
    if (!scan) {
      this.logger.warn(`Scan ${scanId} missing`);
      return;
    }

    await this.prisma.scan.update({
      where: { id: scanId },
      data: { status: 'RUNNING' },
    });

    try {
      await new Promise((r) => setTimeout(r, 400));

      const { issues, score } = this.scoring.buildScanResults(
        scan.siteId,
        scanId,
        scan.site.platform,
      );

      await this.prisma.$transaction(async (tx) => {
        for (const issue of issues) {
          await tx.issue.create({
            data: {
              scanId,
              siteId: scan.siteId,
              issueType: issue.issueType,
              pillar: issue.pillar,
              severity: issue.severity,
              title: issue.title,
              description: issue.description,
              impactEstimate: issue.impactEstimate ?? undefined,
              confidence: issue.confidence,
              evidence: issue.evidence as object,
              fixCatalogId: issue.fixCatalogId ?? undefined,
            },
          });
        }

        await tx.scoreSnapshot.create({
          data: {
            scanId,
            siteId: scan.siteId,
            overallPercent: score.overallPercent,
            performancePercent: score.performancePercent,
            discoverabilityPercent: score.discoverabilityPercent,
            contentPercent: score.contentPercent,
            scoringEngineVersion: score.scoringEngineVersion,
          },
        });

        await tx.scan.update({
          where: { id: scanId },
          data: {
            status: 'COMPLETED',
            finishedAt: new Date(),
            pageBudgetConsumed: 25,
          },
        });
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'scan failed';
      this.logger.error(`Scan ${scanId} failed: ${message}`);
      await this.prisma.scan.update({
        where: { id: scanId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          error: message,
        },
      });
    }
  }
}
