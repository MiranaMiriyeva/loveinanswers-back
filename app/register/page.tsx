"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiAuth } from "@/lib/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Lang } from "@/app/i18n/dictionaries";
import { t } from "@/app/i18n/dictionaries";
import { Eye, EyeOff } from "lucide-react";

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

type FormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
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
  const R = dict.registerUi; // ✅ aşağıda tərcümələri verirəm

  const [serverErr, setServerErr] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
const [showPass2, setShowPass2] = useState(false);

  // ✅ schema is language-aware
  const schema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(3, R.errUserMin)
            .max(30, R.errUserMax)
            .regex(/^[a-zA-Z0-9_]+$/, R.errUserRegex),
          email: z.string().min(1, R.errEmailReq).email(R.errEmailFmt),
          password: z.string().min(6, R.errPassMin),
          confirmPassword: z.string().min(6, R.errPassConfirmReq),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: R.errPassMatch,
          path: ["confirmPassword"],
        }),
    [R]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerErr(null);
    try {
      const res = await apiAuth<{ token: string }>("/api/auth/register", {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } catch (e: any) {
      setServerErr(e?.message || R.errServer);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-rose-300/50 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-pink-300/50 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs text-rose-700">
            💗 {R.badge}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
            {R.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-700">{R.sub}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            {/* USERNAME */}
            <div>
              <label className="text-xs font-medium text-zinc-700">{R.usernameLabel}</label>
              <input
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${
                  errors.username ? "border-red-300" : "border-zinc-200"
                }`}
                placeholder={R.usernamePh}
                autoComplete="username"
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500">{R.usernameHint}</p>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs font-medium text-zinc-700">{R.emailLabel}</label>
              <input
                className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${
                  errors.email ? "border-red-300" : "border-zinc-200"
                }`}
                placeholder={R.emailPh}
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
       <div className="relative">
  <input
    className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${
      errors.password ? "border-red-300" : "border-zinc-200"
    }`}
    placeholder={R.passPh}
    type={showPass ? "text" : "password"}
    autoComplete="new-password"
    {...register("password")}
  />

  <button
    type="button"
    onClick={() => setShowPass((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-700"
    aria-label={showPass ? "Hide password" : "Show password"}
  >
    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>


            {/* CONFIRM PASSWORD */}
        <div className="relative">
  <input
    className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${
      errors.confirmPassword ? "border-red-300" : "border-zinc-200"
    }`}
    placeholder={R.pass2Ph}
    type={showPass2 ? "text" : "password"}
    autoComplete="new-password"
    {...register("confirmPassword")}
  />

  <button
    type="button"
    onClick={() => setShowPass2((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-700"
    aria-label={showPass2 ? "Hide password" : "Show password"}
  >
    {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
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
              {isSubmitting ? R.loading : R.submit}
            </button>

            <div className="pt-2 text-center text-xs text-zinc-500">
              {R.footerMini}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
