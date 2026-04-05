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
};

// Inline script runs synchronously before React hydrates — eliminates flash
const themeScript = `
(function() {
  try {
    var mode  = localStorage.getItem('mode')  || 'dark';
    var theme = localStorage.getItem('theme') || 'indigo';
    document.documentElement.setAttribute('data-mode',  mode);
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <body className="flex h-screen overflow-hidden bg-slate-950 font-sans antialiased">
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-screen-2xl p-6">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
