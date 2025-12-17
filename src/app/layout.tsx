import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ミアイ - 在日外国人のマッチングサービス | 相亲平台",
  description: "在日外国人向けマッチングアプリ。外国人同士・国際カップルの出会いをサポート。在日外国人交友平台，支持外国人之间及国际情侣的相遇。",
  keywords: ["マッチングアプリ", "在日外国人", "国際結婚", "相亲", "交友", "dating", "foreigners in Japan", "international couples"],
  authors: [{ name: "ミアイ" }],
  openGraph: {
    title: "ミアイ - 在日外国人のマッチングサービス",
    description: "在日外国人向けマッチングアプリ。外国人同士・国際カップルの出会いをサポート。",
    url: "https://miai-olive.vercel.app",
    siteName: "ミアイ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ミアイ - 在日外国人のマッチングサービス",
    description: "在日外国人向けマッチングアプリ。外国人同士・国際カップルの出会いをサポート。",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://miai-olive.vercel.app",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>{children}</SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
