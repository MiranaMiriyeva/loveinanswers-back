"use client";

import { useParams, useRouter } from "next/navigation";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { t } from "@/app/i18n/dictionaries";
import { useLang } from "@/app/i18n/useLang";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

type Gift = { title: string; pages: { imageUrl?: string; text?: string }[] };
type ResultRes = {
  scorePercent: number;
  matchesCount: number;
  totalQuestions: number;
  gift: Gift | null;
};

function vibe(score: number) {
  if (score >= 86) return { label: "Best couple 💘", sub: "Siz romantikanın final boss-usuz 😭💗" };
  if (score >= 61) return { label: "Couple goals 💗", sub: "Uyğunluq çox yaxşı gedir ✨" };
  if (score >= 31) return { label: "Getting warmer 💞", sub: "Az qalıb, daha çox tanıyın 😄" };
  return { label: "Cute chaos..", sub: "Hələlik yol var..." };
}

type PageProps = { children: React.ReactNode; className?: string };
const BookPage = forwardRef<HTMLDivElement, PageProps>(function BookPage({ children, className }, ref) {
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
});

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const lang = useLang();
  const dict = t(lang);
  const R = dict.resultUi;

  const [data, setData] = useState<ResultRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);

        const token = localStorage.getItem(`roomToken:${roomId}`);
        if (!token) throw new Error(R.errNoToken);

        const res = await fetch(`${API_BASE}/api/rooms/${roomId}/result`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.message || `Failed (${res.status})`);
        }

        setData((await res.json()) as ResultRes);
      } catch (e: any) {
        setErr(e?.message || "Error");
      }
      // ✅ dil dəyişəndə bu effect yenidən işləməsin (fetch təkrar getməsin)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, [roomId]);

  const vibeInfo = useMemo(() => (data ? vibe(data.scorePercent) : null), [data]);

  if (err) {
    return (
      <div className="relative overflow-hidden rounded-3xl border bg-white p-6">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-200/60 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="relative">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
          <button
            className="mt-4 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700"
            onClick={() => router.push(`/room/${roomId}`)}
            type="button"
          >
            {R.backErrorBtn}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative overflow-hidden rounded-3xl border bg-white p-6">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-200/60 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="relative text-sm text-zinc-600">{R.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO RESULT */}
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-rose-300/50 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-pink-300/50 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-rose-700">
            💌 {R.badge}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{R.title}</h1>

          <p className="mt-1 text-sm text-zinc-700">
            {vibeInfo?.label} — {vibeInfo?.sub}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border bg-white/80 p-4">
              <div className="text-xs text-zinc-500">{R.score}</div>
              <div className="mt-1 text-3xl font-semibold text-rose-700">{data.scorePercent}%</div>
              <div className="mt-1 text-xs text-zinc-500">{R.scoreHint}</div>
            </div>

            <div className="rounded-3xl border bg-white/80 p-4">
              <div className="text-xs text-zinc-500">{R.matches}</div>
              <div className="mt-1 text-3xl font-semibold text-rose-700">
                {data.matchesCount}/{data.totalQuestions}
              </div>
              <div className="mt-1 text-xs text-zinc-500">{R.matchesHint}</div>
            </div>

            <div className="rounded-3xl border bg-white/80 p-4">
              <div className="text-xs text-zinc-500">{R.vibe}</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-sm font-medium text-white">
                💘 {vibeInfo?.label}
              </div>
              <div className="mt-2 text-xs text-zinc-500">{R.vibeHint}</div>
            </div>
          </div>

          {/* Buttons + Coffee */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => router.push("/")}
                className="rounded-2xl border bg-white/80 px-4 py-3 text-sm hover:bg-white"
                type="button"
              >
                {R.homeBtn}
              </button>
              <button
                onClick={() => router.push(`/room/${roomId}`)}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700"
                type="button"
              >
                {R.backBtn}
              </button>
            </div> */}

            <a
              href="https://kofe.al/@mira"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-rose-100 bg-white/80 p-4 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white">
                    {R.supportPill}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">{R.supportTitle}</div>
                  <div className="mt-1 text-xs text-zinc-600">{R.supportSub}</div>
                </div>
                <div className="mt-1 rounded-full border bg-white px-3 py-2 text-xs text-zinc-700 group-hover:bg-rose-50">
                  {R.open}
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* GIFT BOOK */}
      {data.gift?.pages?.length ? (
        <section className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-200/60 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-200/60 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">💝 {data.gift.title}</h2>
                <p className="mt-1 text-sm text-zinc-600">{R.giftHint}</p>
              </div>
              <div className="text-xs text-zinc-500">{R.pagesMeta(data.gift.pages.length)}</div>
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-full max-w-[560px]">
                <HTMLFlipBook
                  style={{}}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={700}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={true}
                  useMouseEvents={true}
                  swipeDistance={30}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  width={280}
                  height={380}
                  size="stretch"
                  minWidth={240}
                  maxWidth={560}
                  minHeight={340}
                  maxHeight={620}
                  maxShadowOpacity={0.25}
                  showCover={true}
                  mobileScrollSupport={true}
                  className="mx-auto"
                >
                  {/* COVER */}
                  <BookPage className="h-full w-full rounded-3xl border bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6">
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="text-4xl">💗</div>
                      <div className="mt-3 text-2xl font-semibold text-zinc-900">{data.gift.title}</div>
                      <div className="mt-2 text-sm text-zinc-600">{R.coverSub}</div>
                      <div className="mt-6 rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white">
                        {R.coverCta}
                      </div>
                    </div>
                  </BookPage>

                  {/* PAGES */}
                  {data.gift.pages.map((p, idx) => (
                    <BookPage key={idx} className="h-full w-full rounded-3xl border bg-white p-4">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="h-48 w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100" />
                      )}

                      <div className="mt-3 rounded-2xl border bg-rose-50/40 p-3">
                        <div className="text-xs text-zinc-500">
                          {R.page} {idx + 1} 💞
                        </div>
                        <div className="mt-2 text-sm text-zinc-800">{p.text?.trim() ? p.text : "💗"}</div>
                      </div>

                      <div className="mt-3 text-right text-xs text-zinc-400">
                        {idx + 1}/{data.gift?.pages.length}
                      </div>
                    </BookPage>
                  ))}

                  {/* BACK COVER */}
                  <BookPage className="h-full w-full rounded-3xl border bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6">
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="text-4xl">✨</div>
                      <div className="mt-3 text-xl font-semibold text-zinc-900">{R.endTitle}</div>
                      <div className="mt-2 text-sm text-zinc-600">{R.endSub}</div>
                    </div>
                  </BookPage>
                </HTMLFlipBook>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-zinc-500">{R.tip}</div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
