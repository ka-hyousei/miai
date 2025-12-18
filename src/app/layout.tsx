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
  title: "出会い - Love in Japan",
  description: "日本の出会い・マッチングサービス。外国人も日本人も歓迎。日本寻找真爱，面向所有在日单身人士的交友平台。",
  icons: {
    icon: "/favicon.ico?v=2",
  },
  keywords: ["マッチングアプリ", "出会い", "国際結婚", "相亲", "交友", "dating", "Love in Japan", "international couples"],
  authors: [{ name: "出会い" }],
  openGraph: {
    title: "出会い - Love in Japan",
    description: "日本の出会い・マッチングサービス。外国人も日本人も歓迎。",
    url: "https://miai-olive.vercel.app",
    siteName: "出会い",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "出会い - Love in Japan",
    description: "日本の出会い・マッチングサービス。外国人も日本人も歓迎。",
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
