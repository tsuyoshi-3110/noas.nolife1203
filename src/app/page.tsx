import type { Metadata } from "next";
import BackgroundVideo from "@/components/BackgroundVideo";
import TopFixedText from "@/components/TopFixedText";

export const metadata: Metadata = {
  title: "BEAUTY&STUDIO Eight｜福岡市西区のビューティーサロン",
  description:
    "福岡市西区今宿のビューティーサロン『BEAUTY&STUDIO Eight』のトップページ。リラックスと美を追求する空間でお待ちしております。",
  openGraph: {
    title: "BEAUTY&STUDIO Eight｜福岡市西区のビューティーサロン",
    description:
      "小顔キャビや筋膜リリース、ハーブピーリングなど幅広い施術をご提供するBEAUTY&STUDIO Eightのトップページです。",
    url: "https://noasNolife1203-homepage.vercel.app/",
    siteName: "BEAUTY&STUDIO Eight",
    images: [
      {
        url: "/ogp-home.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  alternates: { canonical: "https://noasNolife1203-homepage.vercel.app/" },
};

export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* ① ファーストビュー：背景動画または画像 */}
      <section className="relative h-screen overflow-hidden">
        <BackgroundVideo />
      </section>

      {/* ② テキスト紹介セクション */}
      <section className="relative z-10 text-white px-4 py-20">
        <TopFixedText />

        {/* ページタイトルとリード文 */}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-center leading-tight mb-6">
          BEAUTY&STUDIO Eight
          <br />
          トップページ
        </h1>

        <p className="max-w-3xl mx-auto text-center leading-relaxed">
          福岡市西区今宿にあるBEAUTY&STUDIO Eightでは、心と体の癒しを提供する多彩な施術をご用意しています。
          小顔キャビや筋膜リリース、ふくらはぎ集中ケアなど、お客様の美と健康をサポートします。
        </p>
      </section>

      {/* ③ JSON-LD（構造化データ） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            name: "BEAUTY&STUDIO Eight",
            address: {
              "@type": "PostalAddress",
              postalCode: "819-0167",
              addressRegion: "福岡県",
              addressLocality: "福岡市西区今宿",
              streetAddress: "2-12-3 スリーアイランド今宿802",
            },
            email: "noas.nolife1203@gmail.com",
            url: "https://noasNolife1203-homepage.vercel.app/",
          }),
        }}
      />
    </main>
  );
}
