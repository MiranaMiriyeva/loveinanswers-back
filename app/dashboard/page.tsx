"use client";

import { useEffect, useMemo, useState } from "react";
import { apiWithUser, uploadImage } from "@/lib/api";
import { Lang, t } from "@/app/i18n/dictionaries";

type CreateRoomRes = { roomId: string; sharePath: string };

type RoomQuestion =
  | { id: string; type: "multiple_choice"; text: string; options: { id: string; label: string }[] }
  | { id: string; type: "text"; text: string };

type GiftPage = { imageUrl: string; text: string; previewUrl?: string };

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "az";
  const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  const v = m?.[1];
  return v === "az" || v === "en" || v === "ru" ? v : "az";
}

export default function DashboardPage() {
  const [lang, setLang] = useState<Lang>("az");

 useEffect(() => {
  // ilkin lang
  const init =
    (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) ||
    getLangFromCookie();
  setLang(init === "az" || init === "en" || init === "ru" ? init : "az");

  // ✅ navbar dəyişəndə dinlə
  const onLang = (e: any) => {
    const next = e?.detail;
    if (next === "az" || next === "en" || next === "ru") setLang(next);
    else setLang(getLangFromCookie());
  };

  window.addEventListener("langchange", onLang);

  // əlavə: başqa tab-da dəyişsən də tutmaq üçün
  const onStorage = (ev: StorageEvent) => {
    if (ev.key === "lang" && (ev.newValue === "az" || ev.newValue === "en" || ev.newValue === "ru")) {
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
  const D = dict.dashUi; 

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [partnerUsername, setPartnerUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [expected, setExpected] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<RoomQuestion[]>([
    {
      id: uid(),
      type: "multiple_choice",
      text: D.seedQ1,
      options: [
        { id: uid(), label: D.seedQ1o1 },
        { id: uid(), label: D.seedQ1o2 },
        { id: uid(), label: D.seedQ1o3 },
        { id: uid(), label: D.seedQ1o4 },
      ],
    },
    { id: uid(), type: "text", text: D.seedQ2 },
  ]);

  const [giftEnabled, setGiftEnabled] = useState(true);
  const [giftTitle, setGiftTitle] = useState(D.giftDefaultTitle);
  const [giftPages, setGiftPages] = useState<GiftPage[]>([{ imageUrl: "", text: "", previewUrl: "" }]);

  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const totalQuestions = questions.length;

  const totalExpectedFilled = useMemo(() => {
    let c = 0;
    for (const q of questions) {
      const v = expected[q.id];
      if (q.type === "text") {
        if ((v || "").trim().length > 0) c++;
      } else {
        if (v) c++;
      }
    }
    return c;
  }, [expected, questions]);

  const canGoStep2 = roomCode.trim().length >= 4;
  const canGoStep3 = totalExpectedFilled >= Math.min(3, totalQuestions);

  const giftPagesCount = useMemo(() => {
    return giftPages.filter((p) => (p.imageUrl || "").trim() || (p.text || "").trim() || (p.previewUrl || "").trim()).length;
  }, [giftPages]);

  function setExpectedAnswer(qid: string, value: string) {
    setExpected((p) => ({ ...p, [qid]: value }));
  }

  function addTextQuestion() {
    setQuestions((p) => [...p, { id: uid(), type: "text", text: "" }]);
  }

  function addChoiceQuestion() {
    setQuestions((p) => [
      ...p,
      {
        id: uid(),
        type: "multiple_choice",
        text: "",
        options: [
          { id: uid(), label: "" },
          { id: uid(), label: "" },
          { id: uid(), label: "" },
          { id: uid(), label: "" },
        ],
      },
    ]);
  }

  function removeQuestion(qid: string) {
    setQuestions((p) => p.filter((q) => q.id !== qid));
    setExpected((p) => {
      const copy = { ...p };
      delete copy[qid];
      return copy;
    });
  }

  function updateQuestionText(qid: string, text: string) {
    setQuestions((p) => p.map((q) => (q.id === qid ? ({ ...q, text } as any) : q)));
  }

  function updateOptionLabel(qid: string, oid: string, label: string) {
    setQuestions((p) =>
      p.map((q) => {
        if (q.id !== qid || q.type !== "multiple_choice") return q;
        return { ...q, options: q.options.map((o) => (o.id === oid ? { ...o, label } : o)) };
      })
    );
  }

  function addGiftPage() {
    setGiftPages((p) => [...p, { imageUrl: "", text: "", previewUrl: "" }]);
  }

  function removeGiftPage(i: number) {
    setGiftPages((p) => p.filter((_, idx) => idx !== i));
  }

  function updateGiftPage(i: number, key: keyof GiftPage, value: string) {
    setGiftPages((p) => p.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
  }

  async function handlePickFile(i: number, file: File) {
    setErr(null);

    // local preview
    const local = URL.createObjectURL(file);
    updateGiftPage(i, "previewUrl", local);

    setUploadingIndex(i);
    try {
      const url = await uploadImage(file);
      updateGiftPage(i, "imageUrl", url);
    } catch (e: any) {
      setErr(e?.message || D.errUpload);
    } finally {
      setUploadingIndex(null);
    }
  }

  async function createRoom() {
    setErr(null);
    setShareUrl(null);
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error(D.errNoToken);

      if (!roomCode || roomCode.trim().length < 4) {
        throw new Error(D.errRoomCodeMin);
      }

      const cleanedQuestions = questions
        .map((q) => {
          const text = (q.text || "").trim();
          if (q.type === "text") return { ...q, text };
          return { ...q, text, options: q.options.map((o) => ({ ...o, label: (o.label || "").trim() })) };
        })
        .filter((q) => q.text.length > 0);

      if (cleanedQuestions.length === 0) throw new Error(D.errNeedOneQuestion);

      const minNeed = Math.min(3, cleanedQuestions.length);
      let filled = 0;

      for (const q of cleanedQuestions) {
        const v = expected[q.id];
        if (q.type === "text") {
          if ((v || "").trim()) filled++;
        } else {
          if (v) filled++;
        }
      }

      if (filled < minNeed) throw new Error(D.errNeedExpected(minNeed));

      const giftPayload =
        giftEnabled
          ? {
              title: (giftTitle || D.giftDefaultTitle).trim(),
              pages: giftPages
                .map((p) => ({ imageUrl: (p.imageUrl || "").trim(), text: (p.text || "").trim() }))
                .filter((p) => p.imageUrl || p.text),
            }
          : null;

      const body = {
        partnerUsername: partnerUsername.trim() || undefined,
        roomCode: roomCode.trim(),
        questions: cleanedQuestions,
        expectedAnswers: expected,
        gift: giftPayload,
      };

      const res = await apiWithUser<CreateRoomRes>("/api/rooms", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const origin = window.location.origin;
      const full = `${origin}${res.sharePath}`;
      setShareUrl(full);
      setStep(1);
    } catch (e: any) {
      setErr(e?.message || D.errUnknown);
    } finally {
      setLoading(false);
    }
  }

  function StepPill({ n, title }: { n: 1 | 2 | 3; title: string }) {
    const active = step === n;
    return (
      <button
        type="button"
        onClick={() => setStep(n)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
          active ? "bg-rose-600 text-white border-rose-600" : "bg-white/80 hover:bg-white border-rose-100"
        }`}
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
            active ? "bg-white text-rose-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {n}
        </span>
        <span className="font-medium">{title}</span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-rose-300/50 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-pink-300/50 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-rose-700">
                💘 {D.valentineMode}
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                {D.heroTitle}
              </h1>
              <p className="mt-1 text-sm text-zinc-700">{D.heroSub}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StepPill n={1} title={D.step1} />
              <StepPill n={2} title={D.step2} />
              <StepPill n={3} title={D.step3} />
            </div>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full bg-rose-600 transition-all"
              style={{ width: step === 1 ? "34%" : step === 2 ? "67%" : "100%" }}
            />
          </div>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}
          {/* ☕️ Coffee support */}
<a
  href="https://kofe.al/@mira"
  target="_blank"
  rel="noopener noreferrer"
  className="group mt-4 block overflow-hidden rounded-3xl border border-rose-100 bg-white/75 p-4 shadow-sm transition hover:bg-white hover:shadow"
>
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white">
        ☕️ {D.kofeBadge}
      </div>

      <div className="mt-2 text-sm font-semibold text-zinc-900">
        {D.kofeTitle}
      </div>

      <div className="mt-1 text-xs text-zinc-600">
        {D.kofeSub}
      </div>
    </div>

    <div className="mt-1 shrink-0 rounded-full border bg-white px-3 py-2 text-xs text-zinc-700 group-hover:bg-rose-50">
      {D.kofeOpen} ↗
    </div>
  </div>
</a>

        </div>
      </section>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">1) {D.s1Title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{D.s1Sub}</p>
            </div>
            <div className="rounded-2xl border bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <div className="text-xs opacity-80">{D.ready}</div>
              <div className="font-semibold">
                {totalExpectedFilled}/{totalQuestions} {D.answersDone}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-zinc-700">{D.partnerUsernameLabel}</label>
              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder={D.partnerUsernamePh}
                value={partnerUsername}
                onChange={(e) => setPartnerUsername(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-500">{D.partnerUsernameHint}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700">{D.roomCodeLabel}</label>
              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder={D.roomCodePh}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-500">{D.roomCodeHint}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canGoStep2}
              className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {D.toStep2}
            </button>

            {shareUrl ? (
              <div className="flex flex-1 items-center gap-2 rounded-2xl border bg-white px-4 py-3">
                <span className="text-sm">💌 {D.link}:</span>
                <input className="w-full bg-transparent text-sm outline-none" value={shareUrl} readOnly />
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                >
                  {D.copy}
                </button>
              </div>
            ) : (
              <div className="text-sm text-zinc-500">{D.linkHint}</div>
            )}
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">2) {D.s2Title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{D.s2Sub}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addChoiceQuestion}
                className="rounded-2xl border bg-rose-50 px-4 py-3 text-sm text-rose-700 hover:bg-rose-100"
              >
                + {D.addChoice}
              </button>
              <button
                type="button"
                onClick={addTextQuestion}
                className="rounded-2xl border bg-pink-50 px-4 py-3 text-sm text-pink-700 hover:bg-pink-100"
              >
                + {D.addText}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            ✅ {D.readyAnswers}: <b>{totalExpectedFilled}</b> / <b>{totalQuestions}</b> • {D.minimum}:{" "}
            <b>{Math.min(3, totalQuestions)}</b>
          </div>

          <div className="mt-5 space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-3xl border p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                      ❤️ {D.q} {idx + 1}
                    </span>
                    <span className="text-xs text-zinc-500">{q.type === "text" ? D.typeText : D.typeChoice}</span>
                  </div>
                  <button type="button" onClick={() => removeQuestion(q.id)} className="rounded-full border px-3 py-1 text-xs hover:bg-black/5">
                    {D.delete}
                  </button>
                </div>

                <label className="mt-3 block text-xs font-medium text-zinc-700">{D.qText}</label>
                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  value={q.text}
                  onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  placeholder={D.qTextPh}
                />

                {q.type === "text" ? (
                  <div className="mt-4 rounded-2xl border bg-pink-50/50 p-4">
                    <div className="text-xs font-medium text-zinc-700">{D.expectedTextTitle}</div>
                    <input
                      className="mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                      value={expected[q.id] || ""}
                      onChange={(e) => setExpectedAnswer(q.id, e.target.value)}
                      placeholder={D.expectedTextPh}
                    />
                    <p className="mt-2 text-xs text-zinc-500">{D.expectedTextHint}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {q.options.map((o, i) => {
                        const active = expected[q.id] === o.id;
                        return (
                          <div key={o.id} className={`rounded-2xl border p-3 ${active ? "border-rose-600" : ""}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-zinc-500">
                                {D.option} {i + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpectedAnswer(q.id, o.id)}
                                className={`rounded-full border px-3 py-1 text-xs hover:bg-black/5 ${
                                  active ? "bg-rose-600 text-white border-rose-600" : ""
                                }`}
                              >
                                {active ? D.expectedDone : D.expectedSet}
                              </button>
                            </div>
                            <input
                              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                              value={o.label}
                              onChange={(e) => updateOptionLabel(q.id, o.id, e.target.value)}
                              placeholder={D.optionPh}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{D.choiceHint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setStep(1)} className="rounded-2xl border px-5 py-3 text-sm hover:bg-black/5">
              {D.back}
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canGoStep3}
              className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {D.toStep3}
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">3) {D.s3Title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{D.s3Sub}</p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={giftEnabled}
                onChange={(e) => setGiftEnabled(e.target.checked)}
              />
              {D.giftToggle}
            </label>
          </div>

          {giftEnabled && (
            <>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-700">{D.giftTitleLabel}</label>
                  <input
                    className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                    value={giftTitle}
                    onChange={(e) => setGiftTitle(e.target.value)}
                    placeholder={D.giftTitlePh}
                  />
                  <p className="mt-1 text-xs text-zinc-500">{D.giftTitleHint}</p>
                </div>

                <div className="rounded-2xl border bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <div className="text-xs opacity-80">{D.pagesFilled}</div>
                  <div className="text-lg font-semibold">{giftPagesCount}</div>
                  <div className="mt-1 text-xs opacity-80">{D.pagesFilledHint}</div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {giftPages.map((p, i) => (
                  <div key={i} className="rounded-3xl border p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {D.page} {i + 1} 💌
                      </div>
                      {giftPages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGiftPage(i)}
                          className="rounded-full border px-3 py-1 text-xs hover:bg-black/5"
                        >
                          {D.delete}
                        </button>
                      )}
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-zinc-700">{D.uploadLabel}</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                          disabled={uploadingIndex === i}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            await handlePickFile(i, f);
                            e.currentTarget.value = "";
                          }}
                        />

                        {(p.previewUrl || p.imageUrl) ? (
                          <img
                            src={p.imageUrl || p.previewUrl}
                            alt=""
                            className="mt-3 h-44 w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <p className="mt-2 text-xs text-zinc-500">{D.previewHint}</p>
                        )}

                        {uploadingIndex === i && (
                          <div className="mt-2 rounded-2xl border bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
                            {D.uploading}
                          </div>
                        )}

                        {(p.previewUrl || p.imageUrl) && (
                          <button
                            type="button"
                            className="mt-2 rounded-2xl border px-4 py-2 text-sm hover:bg-black/5"
                            onClick={() => {
                              if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
                              updateGiftPage(i, "previewUrl", "");
                              updateGiftPage(i, "imageUrl", "");
                            }}
                          >
                            {D.removeImage}
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-zinc-700">{D.romanticLabel}</label>
                        <input
                          className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                          value={p.text}
                          onChange={(e) => updateGiftPage(i, "text", e.target.value)}
                          placeholder={D.romanticPh}
                        />
                        <p className="mt-2 text-xs text-zinc-500">{D.romanticHint}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addGiftPage}
                className="mt-4 rounded-2xl border bg-pink-50 px-4 py-3 text-sm text-pink-700 hover:bg-pink-100"
              >
                + {D.addPage}
              </button>
            </>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setStep(2)} className="rounded-2xl border px-5 py-3 text-sm hover:bg-black/5">
              {D.back}
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={createRoom}
                disabled={loading || uploadingIndex !== null}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? D.sending : uploadingIndex !== null ? D.waitUpload : D.finish}
              </button>

              {shareUrl && (
                <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
                  <span className="text-sm">💌</span>
                  <input className="w-64 bg-transparent text-sm outline-none" value={shareUrl} readOnly />
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    {D.copy}
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </section>
      )}

      {/* <div className="text-center text-xs text-zinc-500">{D.footerMini}</div> */}
    </div>
  );
}
