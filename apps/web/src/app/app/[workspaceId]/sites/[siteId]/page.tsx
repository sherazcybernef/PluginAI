'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

type Scan = {
  id: string;
  status: string;
  kind: string;
};

type Score = {
  overallPercent: number;
  performancePercent: number;
  discoverabilityPercent: number;
  contentPercent: number;
  scoringEngineVersion: string;
};

type IssueRow = {
  id: string;
  issueType: string;
  pillar: string;
  severity: string;
  title: string;
  description: string;
  impactEstimate: number | null;
  confidence: string;
  fixCatalogId: string | null;
};

export default function SiteDetailPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const siteId = params.siteId as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshResults = useCallback(async () => {
    const latest = await api<{ score: Score | null; scan: Scan | null }>(
      `/sites/${siteId}/scores/latest`,
    );
    setScore(latest.score);
    const issueRes = await api<{ issues: IssueRow[] }>(
      `/sites/${siteId}/issues`,
    );
    setIssues(issueRes.issues);
    if (latest.scan) setScan(latest.scan);
  }, [siteId]);

  async function runScan() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ scan: Scan }>(
        `/sites/${siteId}/scans?kind=full`,
        { method: 'POST' },
      );
      setScan(res.scan);
      const id = res.scan.id;
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 400));
        const s = await api<Scan & { issues?: unknown[]; score?: Score }>(
          `/scans/${id}`,
        );
        setScan(s);
        if (s.status === 'COMPLETED' || s.status === 'FAILED') {
          if (s.status === 'FAILED') {
            setError((s as { error?: string }).error ?? 'Scan failed');
          }
          break;
        }
      }
      await refreshResults();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan error');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refreshResults().catch(() => {});
  }, [refreshResults]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/app/${workspaceId}/sites`}
          className="text-sm text-brand-500 hover:text-brand-700"
        >
          ← Sites
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white">Site analysis</h1>
          <button
            type="button"
            disabled={busy}
            onClick={runScan}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? 'Running scan…' : 'Run scan'}
          </button>
        </div>
        <p className="mt-2 font-mono text-sm text-zinc-500">
          Site ID: {siteId}
        </p>
      </div>

      {scan && (
        <p className="text-sm text-zinc-400">
          Latest scan:{' '}
          <span className="text-zinc-200">{scan.status}</span> ({scan.kind})
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {score && (
        <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Overall
            </p>
            <p className="mt-1 text-3xl font-semibold text-brand-500">
              {score.overallPercent}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Performance
            </p>
            <p className="mt-1 text-2xl text-white">
              {score.performancePercent}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Discoverability
            </p>
            <p className="mt-1 text-2xl text-white">
              {score.discoverabilityPercent}%
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Content clarity
            </p>
            <p className="mt-1 text-2xl text-white">{score.contentPercent}%</p>
          </div>
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-zinc-500">
            Engine {score.scoringEngineVersion} · Synthetic MVP — replace with
            lab + crawl per PRD.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-white">Issues</h2>
        <ul className="mt-4 space-y-3">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-white">{issue.title}</p>
                <span className="text-xs text-zinc-500">
                  {issue.severity} · {issue.pillar}
                  {issue.fixCatalogId && (
                    <> · fix {issue.fixCatalogId}</>
                  )}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{issue.description}</p>
              {issue.impactEstimate != null && (
                <p className="mt-2 text-xs text-brand-500">
                  Est. overall impact: {issue.impactEstimate}% (model —
                  verify with re-scan)
                </p>
              )}
            </li>
          ))}
        </ul>
        {issues.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            No completed scan yet — run a scan to populate issues.
          </p>
        )}
      </section>
    </div>
  );
}
