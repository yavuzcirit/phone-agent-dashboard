import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "CallBank — Voice AI Suite",
    template: "%s | CallBank",
  },
  description:
    "Enterprise Voice AI dashboard for Call Bank. Real-time analytics, outbound calling, and AI-powered knowledge base.",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

// Runs before React hydrates — eliminates flash of wrong theme/mode.
const themeScript = `(function(){try{var m=localStorage.getItem('mode')||'dark';var t=localStorage.getItem('theme')||'indigo';document.documentElement.setAttribute('data-mode',m);document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex h-screen overflow-hidden bg-slate-950 font-sans antialiased">
        <ThemeProvider>
          {/* Sidebar renders both mobile drawer + desktop fixed sidebar */}
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {/* Mobile: pt for top mini-header (~3.25rem), pb for bottom tab bar (~4rem) */}
            <div className="mx-auto max-w-screen-2xl p-4 pt-[4rem] pb-[5rem] md:p-6 md:pt-6 md:pb-6">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
