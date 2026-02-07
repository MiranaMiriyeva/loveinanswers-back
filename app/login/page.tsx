"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiAuth } from "@/lib/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Lang } from "@/app/i18n/dictionaries";
import { t } from "@/app/i18n/dictionaries";

function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "az";
  const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  const v = m?.[1];
  return v === "az" || v === "en" || v === "ru" ? v : "az";
}

function getLangFast(): Lang {
  if (typeof window === "undefined") return "az";
  const ls = localStorage.getItem("lang");
  if (ls === "az" || ls === "en" || ls === "ru") return ls;
  return getLangFromCookie();
}

type FormValues = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();

  // ✅ language (auto update, no refresh)
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
  const A = dict.loginUi; // ✅ aşağıda tərcümələri verirəm

  const [serverErr, setServerErr] = useState<string | null>(null);

  // ✅ schema is language-aware (recomputed when lang changes)
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, A.errEmailReq).email(A.errEmailFmt),
        password: z.string().min(6, A.errPassMin),
      }),
    [A]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerErr(null);
    try {
      const res = await apiAuth<{ token: string }>("/api/auth/login", values);
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } catch (e: any) {
      setServerErr(e?.message || A.errServer);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-300/50 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-300/50 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-rose-700">
            💌 {A.badge}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
            {A.title} 💞
          </h1>
          <p className="mt-1 text-sm text-zinc-700">{A.sub}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            {/* EMAIL */}
            <div>
              <label className="text-xs font-medium text-zinc-700">{A.emailLabel}</label>
              <input
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${
                  errors.email ? "border-red-300" : "border-zinc-200"
                }`}
                placeholder={A.emailPh}
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-medium text-zinc-700">{A.passLabel}</label>
              <input
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${
                  errors.password ? "border-red-300" : "border-zinc-200"
                }`}
                placeholder={A.passPh}
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* SERVER ERROR */}
            {serverErr && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverErr}
              </div>
            )}

            {/* SUBMIT */}
            <button
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {isSubmitting ? A.loading : A.submit}
            </button>

            {/* FOOTER LINKS */}
            <div className="pt-2 text-center text-xs text-zinc-500">
              {A.footerMini}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
