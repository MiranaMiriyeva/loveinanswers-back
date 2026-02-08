import { Navbar } from "@/app/components/Navbar";
import "./globals.css";

import type { Metadata } from "next";
import { Footer } from "@/app/components/Footer";


export const metadata = {
  title: {
    default: "LoveInAnswers 💗 – Couple Quiz & Love Book",
    template: "%s | LoveInAnswers",
  },
  description:
    "Create a romantic couple quiz, get your match score and unlock a cute love book gift 💘",
  metadataBase: new URL("https://loveinanswers.site"),
  openGraph: {
    title: "LoveInAnswers 💗",
    description:
      "Couple quiz, match score and a romantic gift book — all in one link.",
    url: "https://loveinanswers.site",
    siteName: "LoveInAnswers",
    images: [
      {
        url: "/loveinanswersminilogo.png",
        width: 1200,
        height: 630,
        alt: "LoveInAnswers preview",
      },
    ],
      icons: {
    icon: "/loveinanswersminilogo.png",
  },
    locale: "en_US",
    type: "website",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
     <body className="min-h-screen bg-white text-zinc-900">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
