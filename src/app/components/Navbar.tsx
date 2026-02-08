"use client";

import Link from "next/link";
import Image from "next/image";
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
    if (m?.[1] === "az" || m?.[1] === "en" || m?.[1] === "ru") setLang(m[1]);
  }, [pathname]);

  function setLanguage(l: Lang) {
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    setLang(l);

    // ✅ refreshsiz bütün səhifələrə xəbər ver (sən Dashboard-da bunu dinləyirsən)
    window.dispatchEvent(new CustomEvent("langchange", { detail: l }));
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
     <Link href="/" className="group flex items-center gap-3">
  <div className="relative h-11 w-11">
    <div className="heartbeat absolute inset-0 rounded-2xl bg-rose-500/20 blur-md" />
    <div className="relative h-full w-full overflow-hidden rounded-2xl border-2 border-rose-300 bg-white shadow-sm">
      <Image
        src="/loveinanswersminilogo.png"
        alt="LoveInAnswers"
        fill
        sizes="44px"
        priority
        className="object-contain p-1"
      />
    </div>
  </div>

  {/* TEXT */}
{/* TEXT */}
<div className="min-w-0 leading-tight">
  <div className="truncate font-semibold tracking-tight text-zinc-900">
    {dict.brand}
  </div>

  {/* subtitle: yalnız sm+ ekranda görünsün */}
  <div className="hidden text-xs text-rose-600 sm:block">
    <span className="line-clamp-1">{dict.home.title}</span>
  </div>
</div>

</Link>


        {/* ACTIONS */}
        <div className="flex items-center md:gap-3 gap-1">
          {/* LANG SWITCH */}
<div
  className="
    flex items-center gap-1
    rounded-full
    px-2 py-1 text-xs
    border-0 bg-transparent
    sm:border sm:border-rose-200
    sm:bg-rose-50
  "
>
  {(["az", "en", "ru"] as Lang[]).map((l) => (
    <button
      key={l}
      onClick={() => setLanguage(l)}
      className={`rounded-full px-2 py-1 transition ${
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
              <Link href="/dashboard" className="rounded-full px-3 py-2 text-sm text-rose-700 hover:bg-rose-50">
                {dict.nav.dashboard}
              </Link>
              <button onClick={logout} className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-black/5">
                {dict.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm text-rose-700 hover:bg-rose-50">
                {dict.nav.login}
              </Link>
              <Link href="/register" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
                {dict.nav.register} 💘
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
