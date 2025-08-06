import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  kosugiMaru,
  notoSansJP,
  shipporiMincho,
  reggaeOne,
  yomogi,
  hachiMaruPop,
} from "@/lib/font";
import "./globals.css";
import Header from "@/components/Header";
import Script from "next/script";
import ThemeBackground from "@/components/ThemeBackground";
import WallpaperBackground from "@/components/WallpaperBackground";
import SubscriptionOverlay from "@/components/SubscriptionOverlay";
import AnalyticsLogger from "@/components/AnalyticsLogger";
import FontLoader from "@/components/FontLoader";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "BEAUTY&STUDIO Eight｜福岡市西区のビューティーサロン",
  description:
    "福岡市西区今宿のビューティーサロン『BEAUTY&STUDIO Eight』。小顔キャビや筋膜リリースなど多彩な施術をご提供しています。",
  openGraph: {
    title: "BEAUTY&STUDIO Eight｜福岡市西区のビューティーサロン",
    description:
      "福岡市西区今宿のBEAUTY&STUDIO Eightでは、小顔キャビや筋膜リリースなどの施術を提供中。リラックスしたひとときをお過ごしください。",
    url: "https://beautystudioeight.shop/",
    siteName: "BEAUTY&STUDIO Eight",
    images: [
      {
        url: "https://beautystudioeight.shop/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteKey = "noasNolife1203";

  return (
    <html
      lang="ja"
      className={`
        ${geistSans.variable} ${geistMono.variable}
        ${kosugiMaru.variable} ${notoSansJP.variable}
        ${yomogi.variable} ${hachiMaruPop.variable} ${reggaeOne.variable} ${shipporiMincho.variable}
        antialiased
      `}
    >
      <head>
        <link rel="preload" as="image" href="/logo.png" type="image/png" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="google-site-verification"
          content="UcH7-5B4bwpJxxSjIpBskahFhBRTSLRJUZ8A3LAnnFE"
        />
        <meta
          name="google-site-verification"
          content="h2O77asgMDfUmHBb7dda53OOJdsxv9GKXd5rrRgIQ-k"
        />
      </head>
      <body className="relative min-h-screen font-[var(--selected-font)]">
        <SubscriptionOverlay siteKey={siteKey} />
        <AnalyticsLogger />
        <WallpaperBackground />
        <ThemeBackground />
        <Header />
        <FontLoader />
        {children}

        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            name: "BEAUTY&STUDIO Eight",
            address: {
              "@type": "PostalAddress",
              postalCode: "819-0167",
              addressRegion: "福岡県",
              addressLocality: "福岡市西区",
              streetAddress: "今宿2-12-3 スリーアイランド今宿802",
            },
            email: "noas.nolife1203@gmail.com",
            url: "https://beautystudioeight.shop",
          })}
        </Script>
      </body>
    </html>
  );
}
