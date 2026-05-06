import { Injectable } from '@nestjs/common';
import {
  Confidence,
  IssueSeverity,
  PillarKind,
  PlatformType,
} from '@prisma/client';

export type IssueTemplate = {
  issueType: string;
  pillar: PillarKind;
  severity: IssueSeverity;
  title: string;
  description: string;
  confidence: Confidence;
  fixCatalogId: string | null;
  pillarPenalty: number;
};

const MVP_ISSUES: IssueTemplate[] = [
  {
    issueType: 'perf.lcp_image_not_prioritized',
    pillar: PillarKind.PERFORMANCE,
    severity: IssueSeverity.HIGH,
    title: 'LCP image not prioritized',
    description:
      'The largest contentful paint candidate image should use fetchpriority="high" and avoid lazy-loading.',
    confidence: Confidence.HIGH,
    fixCatalogId: 'FX-01',
    pillarPenalty: 12,
  },
  {
    issueType: 'perf.oversized_images',
    pillar: PillarKind.PERFORMANCE,
    severity: IssueSeverity.MEDIUM,
    title: 'Oversized hero imagery',
    description: 'Key images are served larger than their display dimensions.',
    confidence: Confidence.HIGH,
    fixCatalogId: 'FX-02',
    pillarPenalty: 8,
  },
  {
    issueType: 'perf.font_display_missing',
    pillar: PillarKind.PERFORMANCE,
    severity: IssueSeverity.MEDIUM,
    title: 'Blocking web fonts',
    description:
      'Font files lack font-display: swap or equivalent, delaying text render.',
    confidence: Confidence.HIGH,
    fixCatalogId: 'FX-03',
    pillarPenalty: 7,
  },
  {
    issueType: 'perf.render_blocking_scripts',
    pillar: PillarKind.PERFORMANCE,
    severity: IssueSeverity.MEDIUM,
    title: 'Render-blocking scripts',
    description: 'Scripts in head block first paint; defer or async where safe.',
    confidence: Confidence.MEDIUM,
    fixCatalogId: 'FX-04',
    pillarPenalty: 9,
  },
  {
    issueType: 'perf.third_party_script_cost',
    pillar: PillarKind.PERFORMANCE,
    severity: IssueSeverity.MEDIUM,
    title: 'Heavy third-party scripts',
    description:
      'Marketing/analytics tags contribute disproportionately to main-thread time.',
    confidence: Confidence.MEDIUM,
    fixCatalogId: 'FX-05',
    pillarPenalty: 6,
  },
  {
    issueType: 'seo.canonical_mismatch',
    pillar: PillarKind.DISCOVERABILITY,
    severity: IssueSeverity.HIGH,
    title: 'Canonical URL mismatch',
    description:
      'Canonical tag does not align with the preferred URL pattern for this template.',
    confidence: Confidence.HIGH,
    fixCatalogId: 'FX-06',
    pillarPenalty: 14,
  },
  {
    issueType: 'seo.noindex_unexpected',
    pillar: PillarKind.DISCOVERABILITY,
    severity: IssueSeverity.BLOCKER,
    title: 'Unexpected noindex on key URL',
    description:
      'A monetized template is marked noindex; verify before publication.',
    confidence: Confidence.HIGH,
    fixCatalogId: 'FX-07',
    pillarPenalty: 35,
  },
  {
    issueType: 'seo.meta_description_missing',
    pillar: PillarKind.DISCOVERABILITY,
    severity: IssueSeverity.LOW,
    title: 'Missing meta descriptions',
    description: 'Primary templates lack meta descriptions.',
    confidence: Confidence.HIGH,
    fixCatalogId: 'FX-08',
    pillarPenalty: 5,
  },
  {
    issueType: 'content.faq_schema_opportunity',
    pillar: PillarKind.CONTENT,
    severity: IssueSeverity.LOW,
    title: 'FAQ structured data opportunity',
    description:
      'High-intent pages could expose concise FAQ schema aligned to intent clusters.',
    confidence: Confidence.MEDIUM,
    fixCatalogId: null,
    pillarPenalty: 6,
  },
];

/** Deterministic pseudo-random 0..1 from string seed */
function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function platformAdjustment(platform: PlatformType): number {
  switch (platform) {
    case PlatformType.SHOPIFY:
      return -3;
    case PlatformType.WORDPRESS:
      return -2;
    default:
      return 0;
  }
}

@Injectable()
export class ScoringService {
  /**
   * Pick issues and compute pillar scores + overall using PRD §16.1 blend:
   * Performance 45%, Discoverability 40%, Content 15%.
   */
  buildScanResults(siteId: string, scanId: string, platform: PlatformType) {
    const seed = `${scanId}:${siteId}`;
    const n =
      4 +
      Math.floor(seededUnit(seed + 'n') * (MVP_ISSUES.length - 3));

    const indices = MVP_ISSUES.map((_, i) => i)
      .sort((a, b) => seededUnit(seed + a) - seededUnit(seed + b))
      .slice(0, n);

    const selected = indices.map((i) => MVP_ISSUES[i]);

    let perf = 92 + platformAdjustment(platform);
    let disc = 90 + platformAdjustment(platform);
    let content = 85;

    const impactByIssue: { template: IssueTemplate; impact: number }[] = [];

    for (const t of selected) {
      const jitter = seededUnit(scanId + t.issueType) * 4 - 2;
      let penalty = Math.min(t.pillarPenalty + jitter, 45);
      if (t.severity === IssueSeverity.BLOCKER) {
        penalty = Math.max(penalty, 28);
      }
      penalty = Math.max(3, penalty);

      if (t.pillar === PillarKind.PERFORMANCE) {
        perf -= penalty;
      } else if (t.pillar === PillarKind.DISCOVERABILITY) {
        disc -= penalty;
      } else {
        content -= penalty;
      }

      const overallImpact =
        t.pillar === PillarKind.PERFORMANCE
          ? -(penalty * 0.45)
          : t.pillar === PillarKind.DISCOVERABILITY
            ? -(penalty * 0.4)
            : -(penalty * 0.15);

      impactByIssue.push({
        template: t,
        impact: Math.round(overallImpact * 10) / 10,
      });
    }

    perf = Math.max(18, Math.min(99, perf));
    disc = Math.max(18, Math.min(99, disc));
    content = Math.max(18, Math.min(99, content));

    const overall =
      Math.round(
        (perf * 0.45 + disc * 0.4 + content * 0.15 + Number.EPSILON) * 10,
      ) / 10;

    const issues = impactByIssue.map(({ template: t, impact }) => ({
      issueType: t.issueType,
      pillar: t.pillar,
      severity: t.severity,
      title: t.title,
      description: t.description,
      confidence: t.confidence,
      fixCatalogId: t.fixCatalogId,
      impactEstimate: impact,
      evidence: {
        source: 'mvp-synthetic-v1',
        scanId,
        disclaimer:
          'Synthetic MVP scan — replace with lab/crawl pipeline per PRD §6.',
      },
    }));

    return {
      issues,
      score: {
        overallPercent: overall,
        performancePercent: perf,
        discoverabilityPercent: disc,
        contentPercent: content,
        scoringEngineVersion: '1.0.0-mvp',
      },
    };
  }
}
