'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

type Site = {
  id: string;
  url: string;
  platform: string;
  name: string | null;
};

export default function SitesPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [sites, setSites] = useState<Site[]>([]);
  const [url, setUrl] = useState('https://example.com');
  const [platform, setPlatform] = useState('SHOPIFY');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await api<Site[]>(
      `/workspaces/${workspaceId}/sites`,
    );
    setSites(list);
  }, [workspaceId]);

  useEffect(() => {
    load().catch((e) => setError(String(e.message)));
  }, [load]);

  async function addSite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api(`/workspaces/${workspaceId}/sites`, {
        method: 'POST',
        body: JSON.stringify({
          url,
          platform,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/app"
          className="text-sm text-brand-500 hover:text-brand-700"
        >
          ← Workspaces
        </Link>
        <h1 className="text-2xl font-semibold text-white">Sites</h1>
        <p className="text-sm text-zinc-400">
          Add a storefront URL and platform (verification simulated in MVP).
        </p>
      </div>

      <form
        onSubmit={addSite}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-400">URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-w-[240px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-brand-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-400">Platform</span>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-brand-500"
          >
            <option value="SHOPIFY">Shopify</option>
            <option value="WORDPRESS">WordPress</option>
            <option value="FRAMER">Framer</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-brand-700"
        >
          Add site
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {sites.map((s) => (
          <li key={s.id}>
            <Link
              href={`/app/${workspaceId}/sites/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-800 px-4 py-3 hover:border-brand-500/40"
            >
              <span className="text-white">{s.url}</span>
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                {s.platform}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
