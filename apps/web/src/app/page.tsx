import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <p className="text-center text-sm uppercase tracking-[0.25em] text-brand-500">
        PluginAI MVP
      </p>
      <h1 className="max-w-xl text-center text-4xl font-semibold leading-tight text-white">
        SEO, Core Web Vitals &amp; AIO — one dashboard
      </h1>
      <p className="max-w-lg text-center text-zinc-400">
        Connect a property, run scans, and review explainable scores and issues.
        This build uses a synthetic scoring pipeline; swap in crawl + lab workers
        per product requirements.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-brand-700"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-500"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
