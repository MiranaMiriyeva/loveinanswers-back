"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lang, t } from "../i18n/dictionaries";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setToken(getToken());
    const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
    if (m?.[1] === "az" || m?.[1] === "en" || m?.[1] === "ru") {
      setLang(m[1]);
    }
  }, [pathname]);

function setLanguage(l: Lang) {
  document.cookie = `lang=${l}; path=/; max-age=31536000`;
  setLang(l);

  // ✅ refreshsiz bütün səhifələrə xəbər ver
  window.dispatchEvent(new Event("lang-changed"));

  // router.refresh() SİL
}


  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/");
  }

  const dict = t(lang);

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-2xl transition-transform group-hover:scale-110">💗</span>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-zinc-900">
              {dict.brand}
            </div>
            <div className="text-xs text-rose-600">
              {dict.home.title}
            </div>
          </div>
        </Link>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* LANG SWITCH */}
          <div className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs">
            {(["az", "en", "ru"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2 py-1 rounded-full transition ${
                  lang === l
                    ? "bg-rose-600 text-white"
                    : "text-rose-700 hover:bg-rose-100"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {token ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
              >
                {dict.nav.dashboard}
              </Link>
              <button
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-black/5"
              >
                {dict.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
              >
                {dict.nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                {dict.nav.register} 💘
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
