"use client";

import { useEffect, useState } from "react";
import { Lang, t } from "../i18n/dictionaries";

export function Footer() {
  const [lang, setLang] = useState<Lang>("az");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
    if (m?.[1] === "az" || m?.[1] === "en" || m?.[1] === "ru") {
      setLang(m[1]);
    }
  }, []);

  const dict = t(lang);

  return (
    <footer className="mt-16 border-t border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              💗 {dict.brand}
            </div>
            <p className="mt-2 max-w-sm text-sm text-zinc-600">
              {dict.home.subtitle}
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-sm font-medium text-zinc-700">
              Created by Mira 💞
            </div>
            <div className="mt-2 flex gap-3 sm:justify-end">
              <a
                href="mailto:miriyeva.mira05@gmail.com"
                className="text-sm text-rose-700 hover:underline"
              >
                Email
              </a>
              <a
                href="https://github.com/MiranaMiriyeva"
                target="_blank"
                className="text-sm text-rose-700 hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/miran%C9%99-miriyeva?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnxubsADkPnWHr04FB4iTX1S3Nf23j_LevrjwODRvXt04etJDUjGzpFV887cA_aem_qEpyPoCBT_O9rjpWjX-Q6Q"
                target="_blank"
                className="text-sm text-rose-700 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Made with 💗 • {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
