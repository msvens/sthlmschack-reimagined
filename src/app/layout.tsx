import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { OrganizationsProvider } from "@/context/OrganizationsContext";
import { GlobalPlayerCacheProvider } from "@/context/GlobalPlayerCacheContext";
import { GlobalTournamentCacheProvider } from "@/context/GlobalTournamentCacheContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "msvens chess",
  description: "Modern chess tournament portal for Sweden. Find upcoming tournaments, view results, and explore player ratings and history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <OrganizationsProvider>
              <GlobalPlayerCacheProvider>
                <GlobalTournamentCacheProvider>
                  <Navbar />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                </GlobalTournamentCacheProvider>
              </GlobalPlayerCacheProvider>
            </OrganizationsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
