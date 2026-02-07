"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { t } from "@/app/i18n/dictionaries";
import { useLang } from "@/app/i18n/useLang";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

type RoomQuestion =
  | { id: string; type: "multiple_choice"; text: string; options: { id: string; label: string }[] }
  | { id: string; type: "text"; text: string; options?: never };

export default function TestPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const lang = useLang();
  const dict = t(lang);
  const T = dict.testUi;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<RoomQuestion[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const picked = useMemo(() => Object.keys(answers).length, [answers]);
  const total = questions.length;

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const token = localStorage.getItem(`roomToken:${roomId}`);
        if (!token) throw new Error(T.errNoToken);

        const res = await fetch(`${API_BASE}/api/rooms/${roomId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.message || T.errLoadQuestions);
        }

        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (e: any) {
        setErr(e?.message || T.errLoadQuestions);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const token = localStorage.getItem(`roomToken:${roomId}`);
      if (!token) throw new Error(T.errNoToken);

      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answersActual: answers }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || T.errSubmitFail);
      }

      router.push(`/room/${roomId}/result`);
    } catch (e: any) {
      setErr(e?.message || T.errSubmitFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">{T.title}</h1>

          <div className="rounded-full border bg-zinc-50 px-3 py-1 text-sm text-zinc-700">
            {T.progress(picked, total)}
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <button
          disabled={loading || picked === 0}
          onClick={submit}
          className="mt-4 w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          type="button"
        >
          {loading ? T.submitting : T.submit}
        </button>

        <p className="mt-2 text-xs text-zinc-500">{T.onlyOnce}</p>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="rounded-3xl border bg-white p-5">
            <div className="font-medium">{q.text}</div>

            {q.type === "text" ? (
              <input
                className="mt-3 w-full rounded-2xl border px-4 py-3 text-sm"
                placeholder={T.answerPh}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
              />
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((o) => {
                  const active = answers[q.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setAnswers((p) => ({ ...p, [q.id]: o.id }))}
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-left text-sm hover:bg-black/5 ${
                        active ? "bg-black text-white" : ""
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
