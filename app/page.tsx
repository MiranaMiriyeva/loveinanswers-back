import { t } from "@/app/i18n/dictionaries";
import { getLang } from "@/app/i18n/lang";
import Link from "next/link";


type Item = { partnerUsername: string; scorePercent: number; matchesCount: number; totalQuestions: number; createdAt: string };

async function getLeaderboard() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";
  const res = await fetch(`${base}/api/leaderboard`, { cache: "no-store" });
  if (!res.ok) return { items: [] as Item[] };
  return res.json() as Promise<{ items: Item[] }>;
}

export default async function Home() {
  const lang = await getLang();

  const d = t(lang);

  const data = await getLeaderboard();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border bg-white p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-pink-200/60 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-rose-200/60 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{d.home.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600 md:text-base">{d.home.subtitle}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="rounded-2xl bg-black px-5 py-3 text-center text-sm font-medium text-white hover:opacity-90">
              {d.home.cta.start}
            </Link>
            <Link href="/enter" className="rounded-2xl border px-5 py-3 text-center text-sm font-medium hover:bg-black/5">
              {d.home.cta.enter}
            </Link>
          </div>

          {/* <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
            <span className="floaty">💞</span>
            <span>14.02 theme • soft UI • responsive</span>
          </div> */}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6">
        <h2 className="text-lg font-semibold">{d.home.top}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <div className="grid grid-cols-12 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600">
            <div className="col-span-5">User</div>
            <div className="col-span-3">Score</div>
            <div className="col-span-4">Details</div>
          </div>
          <div className="divide-y">
            {data.items?.length ? data.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 px-4 py-3 text-sm">
                <div className="col-span-5 truncate">{it.partnerUsername}</div>
                <div className="col-span-3 font-semibold">{it.scorePercent}%</div>
                <div className="col-span-4 text-zinc-600">{it.matchesCount}/{it.totalQuestions}</div>
              </div>
            )) : (
              <div className="px-4 py-6 text-sm text-zinc-500">No scores yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
