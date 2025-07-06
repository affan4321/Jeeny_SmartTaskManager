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
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
          {/* Temporarily disable BackgroundCanvas for iOS debugging */}
          {/* <ErrorBoundary fallback={<div />}>
            <BackgroundCanvas />
          </ErrorBoundary> */}
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
