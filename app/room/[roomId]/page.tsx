"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiAuth } from "@/lib/api";
import { t } from "@/app/i18n/dictionaries";
import { useLang } from "@/app/i18n/useLang";

type EnterRes = { roomToken: string; alreadySubmitted: boolean };

export default function RoomEnterPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const lang = useLang();
  const dict = t(lang);
  const R = dict.roomEnterUi;

  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enter(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiAuth<EnterRes>(`/api/rooms/${roomId}/enter`, {
        partnerUsername: username,
        roomCode,
      });

      localStorage.setItem(`roomToken:${roomId}`, res.roomToken);

      if (res.alreadySubmitted) router.push(`/room/${roomId}/result`);
      else router.push(`/room/${roomId}/test`);
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-300/40 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-300/40 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs text-rose-700">
            {R.badge}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
            {R.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-700">{R.sub}</p>

          <form onSubmit={enter} className="mt-5 space-y-3">
            <div className="rounded-3xl border bg-white/80 p-4">
              <label className="text-xs font-medium text-zinc-700">{R.usernameLabel}</label>
              <input
                className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder={R.usernamePh}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-500">{R.usernameHint}</p>
            </div>

            <div className="rounded-3xl border bg-white/80 p-4">
              <label className="text-xs font-medium text-zinc-700">{R.roomCodeLabel}</label>
              <input
                className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder={R.roomCodePh}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-500">{R.roomCodeHint}</p>
            </div>

            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <button
              disabled={loading || roomCode.trim().length < 1}
              className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              type="submit"
            >
              {loading ? R.entering : R.enterBtn}
            </button>

     
          </form>
        </div>
      </section>
    </div>
  );
}
