import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import BackgroundCanvas from '@/components/BackgroundCanvas'
import { hasEnvVars } from "@/lib/utils";
import Footer from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Jeeny Smart Task Manager",
  description: "Simple and efficient task management with Next.js and Supabase",
  icons: {
    icon: `/favicon.ico?v=${Date.now()}`,
    shortcut: `/favicon.ico?v=${Date.now()}`,
    apple: `/favicon.ico?v=${Date.now()}`,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary fallback={<div />}>
            <BackgroundCanvas />
          </ErrorBoundary>
          <div className="min-h-screen flex flex-col relative">

            <main className="flex-1 flex flex-col items-center overflow-auto relative z-10">
              {children}
            </main>
            
            <Footer hasEnvVars={hasEnvVars} />
            
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
