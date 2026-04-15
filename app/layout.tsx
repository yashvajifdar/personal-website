import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Yash Vajifdar",
    default: "Yash Vajifdar — Data Engineering & AI",
  },
  description:
    "Senior data engineering leader who builds teams, platforms, and culture at scale. Currently at Amazon Alexa AI. Also available for analytics consulting with mid-market businesses.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yashvajifdar.com",
    siteName: "Yash Vajifdar",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yashvajifdar",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
