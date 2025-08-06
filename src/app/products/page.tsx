import type { Metadata } from "next";
import ProductsClient from "@/components/ProductsClient";

export const metadata: Metadata = {
  title: "施術メニュー一覧｜BEAUTY&STUDIO Eight",
  description:
    "BEAUTY&STUDIO Eight の施術メニュー一覧ページ。ハーブピーリング、小顔キャビ、筋膜リリースなど写真付きで紹介しています。",
  openGraph: {
    title: "施術メニュー一覧｜BEAUTY&STUDIO Eight",
    description:
      "福岡市西区今宿のBEAUTY&STUDIO Eightによる施術メニュー一覧。ハーブピーリング、小顔ケア、筋膜リリースなどを写真付きでご案内します。",
    url: "https://beautystudioeight.shop/products",
    siteName: "BEAUTY&STUDIO Eight",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
