"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/app/i18n/dictionaries";
import { t } from "@/app/i18n/dictionaries";

function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "az";
  const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  const v = m?.[1];
  return v === "az" || v === "en" || v === "ru" ? v : "az";
}

// ✅ localStorage varsa onu üstün tuturuq (daha “instant” olur)
function getLangFast(): Lang {
  if (typeof window === "undefined") return "az";
  const ls = localStorage.getItem("lang");
  if (ls === "az" || ls === "en" || ls === "ru") return ls;
  return getLangFromCookie();
}

export default function EnterLanding() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("az");
  useEffect(() => {
    setLang(getLangFast());

    const onLang = (e: any) => {
      const next = e?.detail;
      if (next === "az" || next === "en" || next === "ru") setLang(next);
      else setLang(getLangFast());
    };

    window.addEventListener("langchange", onLang);

    const onStorage = (ev: StorageEvent) => {
      if (
        ev.key === "lang" &&
        (ev.newValue === "az" || ev.newValue === "en" || ev.newValue === "ru")
      ) {
        setLang(ev.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("langchange", onLang);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dict = t(lang);
  const E = dict.enterUi; // ✅ bunu aşağıda ayrıca tərcümə kimi atıram

  const [roomId, setRoomId] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const canGo = useMemo(() => roomId.trim().length >= 6, [roomId]); // roomId səndə qısa ola bilərsə 3 et

  function go() {
    const id = roomId.trim();
    if (!id) return setErr(E.errEmpty);
    if (id.length < 3) return setErr(E.errShort);
    setErr(null);
    router.push(`/room/${id}`);
  }

  return (
    <div className="mx-auto max-w-md">
      <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-300/50 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-300/50 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-rose-700">
            💌 {E.badge}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
            {E.title} 💞
          </h1>
          <p className="mt-1 text-sm text-zinc-700">{E.sub}</p>

          <div className="mt-5 rounded-3xl border bg-white/80 p-4">
            <label className="text-xs font-medium text-zinc-700">{E.roomIdLabel}</label>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder={E.roomIdPh}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") go();
                }}
              />

              <button
                type="button"
                onClick={go}
                disabled={!canGo}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {E.goBtn} →
              </button>
            </div>

            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="text-xs text-zinc-500">{E.hint}</p>
              <span className="text-xs text-rose-700">{E.tip}</span>
            </div>

            {err && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-zinc-500">
            {E.footerMini}
          </div>
        </div>
      </section>
    </div>
  );
}
