import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathFinder AI - Navigate Life Smarter",
  description: "AI-guided, Context-aware, Purpose-driven navigation for life and physical routes.",
  keywords: ["AI", "navigation", "routes", "personalization", "goals", "wellness"],
  authors: [{ name: "PathFinder AI Team" }],
  creator: "PathFinder AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pathfinder-ai.com",
    title: "PathFinder AI - Navigate Life Smarter",
    description: "AI-guided, Context-aware, Purpose-driven navigation for life and physical routes.",
    siteName: "PathFinder AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathFinder AI - Navigate Life Smarter",
    description: "AI-guided, Context-aware, Purpose-driven navigation for life and physical routes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
