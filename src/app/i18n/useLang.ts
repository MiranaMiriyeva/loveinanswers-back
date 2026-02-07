"use client";

import { useEffect, useState } from "react";
import type { Lang } from "./dictionaries";

function readLang(): Lang {
  if (typeof document === "undefined") return "az";
  const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  const v = decodeURIComponent(m?.[1] || "");
  return v === "az" || v === "en" || v === "ru" ? v : "az";
}

export function useLang() {
  const [lang, setLang] = useState<Lang>("az");

  useEffect(() => {
    // initial
    setLang(readLang());

    // ✅ refreshsiz update üçün:
    const onCookieChanged = () => setLang(readLang());

    // 1) custom event (Navbar-dan dispatch edəcəyik)
    window.addEventListener("lang-changed", onCookieChanged);

    // 2) fallback: tablar arası sync
    window.addEventListener("storage", onCookieChanged);

    return () => {
      window.removeEventListener("lang-changed", onCookieChanged);
      window.removeEventListener("storage", onCookieChanged);
    };
  }, []);

  return lang;
}
