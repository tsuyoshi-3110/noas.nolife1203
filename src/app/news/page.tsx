import type { Metadata } from "next";
import NewsClient from "@/components/NewsClient";

export const metadata: Metadata = {
  title: "お知らせ｜BEAUTY&STUDIO Eight",
  description:
    "BEAUTY&STUDIO Eightのお知らせページ。最新の施術情報や営業スケジュール、キャンペーン情報をお届けします。",
  openGraph: {
    title: "お知らせ｜BEAUTY&STUDIO Eight",
    description:
      "福岡市西区今宿のビューティーサロン『BEAUTY&STUDIO Eight』からのお知らせ。最新施術メニューや営業時間の変更、キャンペーン情報などを掲載中。",
    url: "https://noasNolife1203-homepage.vercel.app/news",
    siteName: "BEAUTY&STUDIO Eight",
    images: [{ url: "/ogp-news.jpg", width: 1200, height: 630 }],
    locale: "ja_JP",
    type: "website",
  },
  alternates: { canonical: "https://noasNolife1203-homepage.vercel.app/news" },
};

export default function NewsPage() {
  return (
    <main className="px-4 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mt-6 mb-6 text-center text-white/80">
        お知らせ
      </h1>
      <NewsClient />
    </main>
  );
}
