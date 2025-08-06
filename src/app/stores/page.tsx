import type { Metadata } from "next";
import StoresClient from "@/components/StoresClient";
import { PhoneSection } from "@/components/PhoneSection";

export const metadata: Metadata = {
  title: "店舗一覧｜BEAUTY&STUDIO Eight",
  description:
    "福岡市西区のビューティーサロン BEAUTY&STUDIO Eight の店舗一覧ページ。各店舗の所在地や施術内容をご覧いただけます。",
  openGraph: {
    title: "店舗一覧｜BEAUTY&STUDIO Eight",
    description:
      "BEAUTY&STUDIO Eight の店舗紹介ページ。福岡市西区今宿の施術ルームなど、各拠点の情報を掲載しています。",
    url: "https://beautystudioeight.shop/stores",
    siteName: "BEAUTY&STUDIO Eight",
    images: [
      {
        url: "/ogp-stores.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};

export default function StoresPage() {
  return (
    <main className="px-4 py-16">
      {/* 電話注文やお問い合わせセクション */}
      <section className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-2xl lg:text-3xl font-extrabold mb-4 text-white/80">
          BEAUTY&STUDIO Eight ─ 店舗一覧
        </h1>
        <p className="leading-relaxed text-white/80">
          <strong>BEAUTY&STUDIO Eight</strong> は<strong>福岡市西区今宿</strong>{" "}
          を拠点に展開する ビューティー＆リラクゼーションサロンです。
          落ち着いたプライベート空間で、
          <br className="hidden lg:block" />
          小顔ケアや筋膜リリースなどの施術をご提供しています。
        </p>
      </section>

      {/* 電話番号や連絡先セクション（必要に応じて編集） */}
      <section className="max-w-4xl mx-auto text-center mb-12">
        <PhoneSection />
      </section>

      {/* 店舗カードのクライアントレンダリング（Firestore対応） */}
      <StoresClient />
    </main>
  );
}
