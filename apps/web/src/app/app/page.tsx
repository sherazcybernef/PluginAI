'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Workspace = {
  id: string;
  name: string;
  slug: string;
  planKey: string;
  creditsBalance: number;
};

type MeResponse = {
  workspaces: Workspace[];
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState('My workspace');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const me = await api<MeResponse>('/me');
      setWorkspaces(me.workspaces ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setName('My workspace');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    }
  }

  if (loading) {
    return <p className="text-zinc-500">Loading workspaces…</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Workspaces</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Each workspace holds connected sites and scan history (MVP).
        </p>
      </div>

      <form
        onSubmit={createWorkspace}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-400">New workspace name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-brand-500"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-brand-700"
        >
          Create workspace
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {workspaces.map((w) => (
          <li key={w.id}>
            <Link
              href={`/app/${w.id}/sites`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition hover:border-brand-500/40 hover:bg-zinc-900/50"
            >
              <p className="font-medium text-white">{w.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{w.slug}</p>
              <p className="mt-3 text-xs text-zinc-400">
                Plan <span className="text-zinc-200">{w.planKey}</span> ·
                Credits{' '}
                <span className="text-zinc-200">{w.creditsBalance}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {workspaces.length === 0 && (
        <p className="text-sm text-zinc-500">
          No workspaces yet — create one to add sites.
        </p>
      )}
    </div>
  );
}
