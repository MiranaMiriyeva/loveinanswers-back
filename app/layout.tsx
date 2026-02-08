import { Navbar } from "@/app/components/Navbar";
import "./globals.css";

import type { Metadata } from "next";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "LoveInAnswers",
  description: "Best couple test + gift book",
  icons: {
    icon: "/loveinanswersminilogo.png",
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
