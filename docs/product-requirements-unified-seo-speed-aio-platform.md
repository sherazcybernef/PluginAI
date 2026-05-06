# Product requirements — unified SEO, speed & “AIO” platform

| Field | Value |
| --- | --- |
| **Status** | Draft for future implementation |
| **Last updated** | 2026-05-06 (ongoing draft) |
| **Purpose** | Single reference for product vision, model, differentiation, and technical scenarios agreed in planning discussions |

## Canonical repository

**Implementation target:** [github.com/sherazcybernef/PluginAI](https://github.com/sherazcybernef/PluginAI)

This workspace may also track a copy under another org remote; treat **PluginAI** as the repo where the plugin, apps, and dashboard code should live.

### Point local clone at PluginAI and publish

Run where you have push access:

```bash
git remote add pluginai https://github.com/sherazcybernef/PluginAI.git
# If PluginAI is empty, push current branch as main once:
git push -u pluginai HEAD:main
# Or push as a feature branch:
git push -u pluginai cursor/aio-platform-requirements-4365
```

Grant write access to whoever deploys from CI (e.g. add the bot/user as a collaborator with push, or use a PAT with `repo` scope).

---

## Table of contents

1. [Vision](#1-vision)
2. [Positioning notes](#2-positioning-notes)
3. [Free vs paid (model)](#3-free-vs-paid-model)
4. [Optimization score (design requirements)](#4-optimization-score-design-requirements)
5. [Differentiation backlog](#5-differentiation-backlog-unique-angles)
6. [Implementation scenario (high level)](#6-implementation-scenario-high-level)
7. [Competitive landscape (summary)](#7-competitive-landscape-summary)
8. [Risks and guardrails](#8-risks-and-guardrails)
9. [Sequencing recommendation](#9-sequencing-recommendation)
10. [Open decisions](#10-open-decisions-fill-when-starting-build)
11. [Glossary](#11-glossary)
12. [Working hypotheses (draft)](#12-working-hypotheses-draft--validate-before-build)
13. [v1 issue taxonomy (starter)](#13-v1-issue-taxonomy-starter)
14. [Framer v1 appendix](#14-framer-v1-appendix)
15. [Backend entities (sketch)](#15-backend-entities-sketch)
16. [v1 fix catalog (prioritized draft)](#16-v1-fix-catalog-prioritized-draft)
17. [API surface (draft)](#17-api-surface-draft)
18. [User journeys](#18-user-journeys)
19. [Non-functional requirements](#19-non-functional-requirements)
20. [Document changelog](#20-document-changelog)

---

## 1. Vision

- One dashboard combining **SEO**, **speed / Core Web Vitals**, and (optionally) **AI-facing content structure** — across **WordPress**, **Shopify**, and **Framer**.
- **Free tier:** full analysis report and issue list (with limits to control cost).
- **Paid tier:** suggested fixes with safe application (preview, rollback where possible), monitoring, and deeper scans.
- **Headline metric:** an overall optimization percentage (e.g. 65% → 85% after verified fixes), with explainable sub-scores and **re-scan verification** after changes (not guessed “projected” unless clearly labeled).

---

## 2. Positioning notes

- **“AIO” / keywords:** Avoid selling raw keyword insertion as the core; it overlaps classic SEO and risks stuffing and weak differentiation. Prefer **topic/intent clusters**, **gap vs chosen competitors**, **safe placements** (titles, H2s, FAQ, schema), **human approval** for copy changes.
- **Honest claims:** Tie the score to **technical and content hygiene**, not guaranteed rankings.
- **Framer:** Expect **crawl + dashboard + playbooks/export** for v1; full auto-fix parity with WordPress/Shopify is not realistic initially — same rubric, **honest execution mode**.

---

## 3. Free vs paid (model)

| Area | Free | Paid |
| --- | --- | --- |
| **Dashboard** | Yes (unified view) | + team/agency, more sites |
| **Analysis report** | Yes (bounded: page budget, cadence) | Larger crawls, on-demand, history |
| **Issue list** | Yes (severity, explanation, generic guidance) | Deep dives, bulk actions, comparisons |
| **Fixes** | — | Guided/one-click apply, rollback, presets |
| **Monitoring** | Basic / periodic | Alerts, regression detection, deploy/app-change correlation |

**Principles:** Free tier must avoid bait-and-switch (show issues **with** context). Paid must save time and reduce risk (**apply + verify + undo**).

---

## 4. Optimization score (design requirements)

- **Composite score** with visible **sub-scores** (e.g. Performance, Discoverability, optional Content clarity) → blended **Overall %**.
- **Per-issue impact:** e.g. “−3% until resolved”; show **confidence** (High/Med/Low) based on measurement type (lab vs field vs inferred).
- **Calibration:** Handle ceiling/floor (strong sites shouldn’t look “perfect” if SEO is weak; catastrophic blockers shouldn’t look like minor % dips). Consider **nonlinear penalties** for hard blockers.
- **After fix:** Prefer **verified score from re-scan**; projected deltas only if labeled with disclaimer/confidence.
- **Data honesty:** Lab metrics can refresh in minutes; CrUX / field CWV is not real-time — label as **real-user / 28-day** style where applicable.

### 4.1 Draft sub-score pillars (for taxonomy work)

| Pillar | Examples of signals | Primary data sources |
| --- | --- | --- |
| Performance | LCP, INP, CLS, TTFB, image/font/script weight | Lab (Lighthouse-style), field (CrUX where available) |
| Discoverability | Indexability, canonicals, robots, sitemaps, structured data basics | Crawl + connector metadata |
| Content clarity (optional v1+) | Title/H1 alignment, thin content signals, FAQ/schema fit | Crawl + NLP/light heuristics; human approval for edits |

*Weights and naming are open decisions until ICP and connector priority are set.*

---

## 5. Differentiation backlog (unique angles)

1. **Explainable score budget** — breakdown + impact + confidence, not a black box.
2. **Dependency-aware fix ordering** — playbook: order matters; paid sequences with checkpoints + rollback.
3. **Third-party script attribution** — tie tags/apps to perf regression by template type (e.g. PDP vs blog).
4. **Change intelligence** — snapshots over time; diff narrative when score drops (theme publish, app install, redirects, headers).
5. **Content vs perf conflict detector** — tradeoffs (e.g. hero media vs LCP) with explicit choices, not blind auto-fix.
6. **Agency mode** — portfolio rollup, approvals queue, exports/white-label (paid).
7. **Framer v1** — apply pack (checklist, copy blocks, embed guidance) + same scoring language.
8. **Warranty layer** — post-fix verified snapshot + one-click rollback marketed clearly.

---

## 6. Implementation scenario (high level)

### Components

- **SaaS backend:** auth, billing, scoring engine, issue store, job queue, history/snapshots.
- **Connectors:** WordPress plugin, Shopify app, Framer via domain verification + crawl (extend later).

### Typical flow

1. **Connect property** → async jobs: lab perf (key URLs), crawl (within limits), script inventory, SEO signals (titles, meta, canonicals, indexability, links, schema basics).
2. **Scoring engine** → Overall % + issues.
3. **Free UI:** report + issues + education.
4. **Paid:** user confirms preview → mutation job (platform-specific) → re-verify → updated score.

### Platform notes

- **Shopify:** OAuth, Admin API, theme/app constraints; webhooks (e.g. theme publish, uninstall).
- **WordPress:** site key; plugin can supply local diagnostics and local apply for many fixes.
- **Framer:** published URL analysis + guided implementation; automation only where supported.

### Infrastructure patterns

Job queue + workers, retries for flaky Lighthouse, partial-result handling, storage for snapshots/diffs as needed.

---

## 7. Competitive landscape (summary)

- **WordPress SEO:** Yoast, Rank Math, AIOSEO, SEOPress, The SEO Framework, etc.
- **WordPress speed:** WP Rocket, NitroPack, Perfmatters, LiteSpeed Cache, Autoptimize, etc.
- **Shopify speed/SEO apps:** Hyperspeed, TinyIMG, various SEO suites; merchants compare reviews and “Built for Shopify.”
- **SaaS content/keyword:** Semrush, Ahrefs, Surfer, Clearscope, Frase, etc.

**Takeaway:** Combination + **explainable %** + **safe paid fixes** + **cross-platform rubric** is the differentiation — not a single feature.

---

## 8. Risks and guardrails

- **Trust:** Opaque scores and fake “after” numbers destroy credibility — transparency and verification required.
- **Liability:** Auto changes to themes/scripts/copy — preview, rollback, narrow v1 scope, clear ToS.
- **Free tier cost:** Enforce page budgets, scan cadence, and API quotas.
- **Support load:** Start with high-fidelity, fewer fixes before maximizing breadth.
- **Crawling:** Respect `robots.txt`; handle bot-blocking via connector-provided URL lists where needed.

---

## 9. Sequencing recommendation

1. **Stabilize** scoring model + issue taxonomy + explainability UI.
2. **Ship two connectors first** (e.g. Shopify + WordPress or pick one wedge ICP); Framer read-only/playbook.
3. **Paid fixes:** low-risk, high-trust automations first; expand catalog with compatibility checks.

---

## 10. Open decisions (fill when starting build)

Use this section as a living checklist. Each item should end with an **owner**, **target date**, and **link** (issue/Notion) when execution starts.

### 10.1 Strategy

- [ ] **First ICP** — e.g. Shopify DTC, WP publishers, agencies.
  - *Decision frame:* who feels the pain of “speed + SEO + AI visibility” together today, and who will pay for safe apply + monitoring?
- [ ] **First connector priority order** — affects schema, webhook work, and fix catalog.
- [ ] **Geographic / language scope for v1** — English-only crawl heuristics vs multilingual.

### 10.2 Product & packaging

- [ ] **Exact free tier limits** — pages per site, sites per workspace, refresh rate, concurrent scans.
- [ ] **Paid SKU boundaries** — seats, sites, scan depth, monitoring tier, agency rollup.
- [ ] **Whether copy changes are always approval-gated in v1** — recommended default: yes for merchant-facing copy.

### 10.3 Score & issues

- [ ] **v1 fix catalog (5–10 items)** mapped to score weights and confidence rules — *draft started in [§16](#16-v1-fix-catalog-prioritized-draft)*.
- [ ] **Blocker definition** — what issues can cap Overall % or trigger prominent UX.
- [ ] **Projection policy** — when/if UI may show estimated delta before re-scan (always labeled).

### 10.4 Technical

- [ ] **Queue & worker stack** — Redis/BullMQ, Cloud Tasks, etc.
- [ ] **Snapshot retention** — TTL, export, GDPR deletion story.
- [ ] **Framer v1 scope** — crawl depth, auth method, playbook format.

---

## 11. Glossary

| Term | Meaning in this doc |
| --- | --- |
| **AIO** | AI-oriented optimization: structuring content so it is clear for humans *and* usable by AI/search surfaces; not “keyword stuffing.” |
| **CWV** | Core Web Vitals (e.g. LCP, INP, CLS). |
| **Lab vs field** | Lab = synthetic tests (fast iteration); field = real-user aggregates (slower, authoritative for UX). |
| **Connector** | Platform-specific integration (WP plugin, Shopify app, Framer verification + crawl). |

---

## 12. Working hypotheses (draft — validate before build)

*These are starting points for discussion, not locked decisions. Replace with research and ICP interviews.*

| Topic | Hypothesis | Validate by |
| --- | --- | --- |
| **First wedge ICP** | **Shopify DTC** merchants with lean engineering (speed apps + SEO apps fragmented); second wave **WP publishers**. Agencies as expansion once rollup exists. | 10 merchant interviews; compare acquisition cost vs WP |
| **Connector order** | **Shopify + WordPress** in parallel after scoring MVP; **Framer** read-only + playbook in same release train (no blocking dependency). | Effort estimate vs one-connector polish |
| **Copy / AI-facing edits** | **Always approval-gated** in v1 for anything customer-visible; suggest-only for free tier | Legal/support review |
| **Free tier (starting numbers)** | e.g. **1 site**, **≤25 URLs** per full crawl, **1 scheduled refresh / 7 days**, manual “refresh now” capped (e.g. 3/month) — tune to COGS | Cost model from Lighthouse + crawl + LLM if used |
| **Paid wedge** | **Monitoring + regression narrative** + **3–5 safe auto-fixes** with rollback beats “more keywords” as headline | Pricing tests |

---

## 13. v1 issue taxonomy (starter)

Use a stable **`issue_type` key** per row for scoring, analytics, and fix mapping. Severity is UX-facing; **blocker** ties to §10.3 calibration.

### Performance (lab-first; field when available)

| Example `issue_type` | Typical severity | Confidence notes |
| --- | --- | --- |
| `perf.lcp_image_not_prioritized` | High | Lab High; field Med if CrUX available |
| `perf.render_blocking_scripts` | High/Med | Lab High |
| `perf.oversized_images` | Med | Lab High |
| `perf.third_party_script_cost` | Med | Lab Med (attribution fuzzy) |
| `perf.font_display_missing` | Low/Med | Lab High |

### Discoverability / technical SEO

| Example `issue_type` | Typical severity | Confidence notes |
| --- | --- | --- |
| `seo.canonical_mismatch` | High | Crawl High |
| `seo.noindex_unexpected` | Blocker | Crawl High |
| `seo.meta_description_missing` | Low/Med | Crawl High |
| `seo.title_h1_divergence` | Med | Crawl / heuristic Med |
| `seo.schema_article_invalid` | Low/Med | Crawl Med |

### Content clarity (optional early v1 — mostly guidance)

| Example `issue_type` | Typical severity | Confidence notes |
| --- | --- | --- |
| `content.faq_schema_opportunity` | Low | Heuristic Med |
| `content.topic_coverage_gap` | Med | vs competitor set — Med/Low |

### Fix readiness flags

Each issue should carry: **`fix_modes`: none \| guide \| auto** (platform-dependent), **`rollback`: yes/no**, **`requires_approval`: yes/no**.

---

## 14. Framer v1 appendix

**Goal:** Same **language** (Overall %, pillars, issue list) without claiming parity with Shopify/WP automation.

| Area | v1 scope | Out of scope (honest) |
| --- | --- | --- |
| **Ingest** | Published URL crawl + manual URL list; domain verification (DNS or meta token pattern TBD) | Theme/asset mutation inside Framer editor |
| **Scoring** | Shared rubric; lab perf on key URLs; crawl-based SEO signals | Deep template-level script attribution like Shopify theme app extensions |
| **Delivery** | **Playbook:** prioritized checklist, export (PDF/Markdown), copy blocks for FAQs/schema where manual paste is acceptable | One-click apply inside Framer |
| **Monitoring** | Periodic re-crawl + email/in-app diff summary | Webhooks comparable to Shopify theme publish |

**UX copy guardrail:** Badge flows as **“Guided”** or **“Export pack”**, not **“Fixed automatically.”**

---

## 15. Backend entities (sketch)

Minimal conceptual model for API/schema discussions (not a final DB diagram).

| Entity | Role |
| --- | --- |
| **User** | Identity, auth, billing contact |
| **Workspace** | Tenant; sites, seats, plan, credits |
| **Site / Property** | URL, platform enum (WP \| Shopify \| Framer), connector credentials/refs |
| **Scan** | Job run: type (crawl, lab, bundle), status, limits consumed |
| **Issue** | Normalized finding: `issue_type`, pillar, severity, impact_estimate, confidence, evidence refs |
| **ScoreSnapshot** | Overall %, pillar sub-scores, methodology version (for reproducibility) |
| **FixProposal** | Preview payload, risk tier, approval state |
| **FixExecution** | Mutation job, platform-specific result, rollback token/id |
| **ChangeEvent** | Optional: correlate webhook or connector event with score delta narrative |

**Methodology versioning:** Any change to weights or issue definitions bumps **`scoring_engine_version`** stored on snapshots so historical reports stay explainable.

---

## 16. v1 fix catalog (prioritized draft)

*candidate set for first paid “safe fixes”; weights are illustrative until calibration (§4).*

### 16.1 Default pillar blend (illustrative)

| Pillar | Share of Overall (draft) | Notes |
| --- | --- | --- |
| Performance | 45% | Dominates merchant-perceived “speed” |
| Discoverability | 40% | Technical SEO + indexation |
| Content clarity | 15% | Optional early v1; can fold into Discoverability initially |

### 16.2 Fix rows

| ID | Primary `issue_type`(s) | Summary | WP | Shopify | Framer v1 | Mode | Rollback | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **FX-01** | `perf.lcp_image_not_prioritized` | Set LCP image `fetchpriority="high"` (and avoid lazy on LCP candidate) | Auto | Guide→Auto\* | Guide | auto/guide | Yes | Low |
| **FX-02** | `perf.oversized_images` | Replace/serve appropriately sized hero/key images (CDN/theme settings) | Guide | Guide | Guide | guide | Partial | Med |
| **FX-03** | `perf.font_display_missing` | Add/repair `@font-face` + `font-display: swap` for blocking fonts | Auto | Guide | Guide | auto/guide | Yes | Low |
| **FX-04** | `perf.render_blocking_scripts` | Defer non-critical JS / relocate blocking scripts where theme allows | Guide | Guide | Guide | guide | Partial | Med |
| **FX-05** | `perf.third_party_script_cost` | Delay/load-interaction pattern for identified third parties (consent-aware) | Guide | Guide | Guide | guide | Yes | Med |
| **FX-06** | `seo.canonical_mismatch` | Align canonical ↔ preferred URL (single rule per template) | Auto | Guide→Auto\* | Guide | auto/guide | Yes | Med |
| **FX-07** | `seo.noindex_unexpected` | Remove/fix accidental `noindex` on key templates | Guide | Guide | Guide | guide | **Yes** | **High** |
| **FX-08** | `seo.meta_description_missing` | Apply template-based meta descriptions (no rewrite of body copy) | Auto | Guide | Guide | auto/guide | Yes | Low |

\*Shopify **Auto** only where Admin API / theme architecture supports a bounded mutation; otherwise **Guide** with preview.

### 16.3 Ordering rules (paid playbook)

1. **FX-07** (if present) before broad perf work — blockers distort perceived gains.
2. **FX-06** before content tweaks that change URLs.
3. **FX-01 → FX-03 → FX-04 → FX-05 → FX-02** as default perf sequence (low regret → higher blast radius).
4. **FX-08** can ship anytime; pair with re-crawl for verification.

---

## 17. API surface (draft)

*REST-shaped; names are indicative. Auth: Bearer session/JWT or workspace API key for connectors.*

### 17.1 Core resources

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/auth/register` | Create user |
| `POST` | `/v1/auth/login` | Issue token |
| `GET` | `/v1/me` | Current user + workspaces summary |
| `POST` | `/v1/workspaces` | Create workspace |
| `GET` | `/v1/workspaces/:workspaceId` | Workspace detail + plan |
| `POST` | `/v1/workspaces/:workspaceId/sites` | Register site (URL, platform, connector handshake) |
| `GET` | `/v1/workspaces/:workspaceId/sites` | List sites |
| `POST` | `/v1/sites/:siteId/scans` | Enqueue scan bundle (`crawl` \| `lab` \| `full`) |
| `GET` | `/v1/scans/:scanId` | Scan status + partial results |
| `GET` | `/v1/sites/:siteId/issues` | Issues for latest or specified snapshot |
| `GET` | `/v1/sites/:siteId/scores/latest` | Latest ScoreSnapshot + methodology id |
| `GET` | `/v1/sites/:siteId/scores` | History (paid / bounded free) |
| `POST` | `/v1/sites/:siteId/fix-proposals` | Build preview for fix id(s) (paid) |
| `POST` | `/v1/fix-proposals/:id/approve` | Record approval |
| `POST` | `/v1/fix-proposals/:id/execute` | Enqueue mutation job |
| `GET` | `/v1/fix-executions/:id` | Status + rollback handle |

### 17.2 Connector & webhooks

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/connectors/wordpress/ping` | Plugin heartbeat + capability negotiation |
| `POST` | `/v1/connectors/shopify/oauth/callback` | OAuth completion |
| `POST` | `/v1/webhooks/shopify` | Theme publish, uninstall, etc. |
| `POST` | `/v1/internal/scans/:scanId/complete` | Worker callback (internal) |

### 17.3 Idempotency & quotas

- **`Idempotency-Key`** header on `POST` mutations that enqueue jobs.
- **`429`** with `retry-after` when workspace exceeds page budget / concurrent scans.
- Response bodies include **`quota_remaining`** where cheap to compute.

---

## 18. User journeys

### 18.1 Free — first value

1. Sign up → create workspace → **Add site** (pick platform).
2. Connector proves ownership (OAuth / site key / DNS).
3. User triggers **first scan** (or automatic enqueue within limits).
4. Dashboard shows **Overall %**, pillar breakdown, **issue list** with education links.
5. User exports or shares **read-only report link** (optional future).

### 18.2 Paid — guided fix + verify

1. User filters issues **fixable** → selects **FX-xx** playbook.
2. System shows **preview diff** + risk tier + **estimated issue impact** (labeled projection if used).
3. User confirms → **FixExecution** runs → **re-scan** auto-enqueued.
4. Dashboard shows **before/after** snapshots; rollback CTA if supported.

### 18.3 Paid — monitoring regression

1. Scheduled scan detects **Overall %** drop beyond threshold vs prior snapshot.
2. Notification links to **change narrative**: correlate `ChangeEvent` (theme publish, app install) when connector provides signal.
3. User opens **diff view** (issues added/resolved) and optional playbook.

---

## 19. Non-functional requirements

| Area | Draft requirement |
| --- | --- |
| **Availability** | Dashboard API target **99.5%** monthly during beta; graceful degradation if lab workers backlog |
| **Latency** | P95 **< 300 ms** for read endpoints backed by DB/cache; scan enqueue **< 1 s** |
| **Security** | OWASP ASVS-aligned auth; encrypt secrets at rest; least-privilege connector tokens |
| **Privacy** | GDPR/CCPA deletion path for workspace; DPA template for B2B; minimize crawled PII |
| **Retention** | Default **90-day** raw crawl artifact TTL (configurable paid); score snapshots kept longer |
| **Observability** | Trace id per `scan_id`/`job_id`; structured logs; alert on worker DLQ growth |
| **Fair use** | Robots-aware crawler; configurable concurrency; blocklist for accidental staging URLs |
| **Billing** | Idempotent Stripe webhooks; credits deducted on completed scan units |

---

## 20. Document changelog

| Date | Author | Notes |
| --- | --- | --- |
| 2026-04-24 | Planning | Initial draft (sections 1–10). |
| 2026-05-06 | — | Structured for repo: TOC, table fixes, sequencing renumbering, sub-score draft table, expanded open decisions, glossary, changelog. |
| 2026-05-06 | — | Resume pass: working hypotheses, v1 issue taxonomy starter, Framer v1 appendix, backend entity sketch. |
| 2026-05-06 | — | Continued: v1 fix catalog (§16), API sketch (§17), user journeys (§18), NFRs (§19); changelog §20. |
