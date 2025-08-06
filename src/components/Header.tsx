"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import clsx from "clsx";

import { useThemeGradient } from "@/lib/useThemeGradient";
import { useHeaderLogoUrl } from "../hooks/useHeaderLogoUrl";
import { auth } from "@/lib/firebase";

/* SNS リンク一覧 */
const SNS: {
  name: string;
  href: string;
  icon: React.FC;
}[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/eight_imajyuku/",
    icon: () => (
      <Image
        src="/instagram-logo.png"
        alt="Instagram"
        width={32}
        height={32}
        className="object-contain"
      />
    ),
  },
  {
    name: "LINE",
    href: "https://lin.ee/a1OmQz2",
    icon: () => (
      <Image
        src="/line-logo.png"
        alt="LINE"
        width={32}
        height={32}
        className="object-contain"
      />
    ),
  },
  {
    name: "HotPepper",
    href: "https://beauty.hotpepper.jp/kr/slnH000479416/coupon/",
    icon: () => (
      <Image
        src="/hotpepper-logo.png"
        alt="HotPepper"
        width={32}
        height={32}
        className="object-contain"
      />
    ),
  },
];

const HEADER_H = "3rem";

export default function Header({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const gradient = useThemeGradient();
  const logoUrl = useHeaderLogoUrl();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const gradientClass = gradient
    ? `bg-gradient-to-b ${gradient}`
    : "bg-gray-100";

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 flex items-center justify-between px-4 h-12",
        gradientClass,
        className
      )}
      style={{ "--header-h": HEADER_H } as React.CSSProperties}
    >
      {/* ロゴ */}
      <Link
        href="/"
        className="text-md text-white font-bold flex items-center gap-2 py-2 hover:opacity-50"
      >
        {logoUrl && logoUrl.trim() !== "" && (
          <Image
            src={logoUrl}
            alt="ロゴ"
            width={48}
            height={48}
            className="w-12 h-12 object-contain transition-opacity duration-200"
          />
        )}
        BEAUTY&STUDIO Eight
      </Link>

      {/* SNS リンク */}
      <nav className="flex gap-2 ml-auto mr-2">
        {SNS.map(({ name, href, icon: Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className="text-white hover:text-pink-600 transition"
          >
            <Icon />
          </a>
        ))}
      </nav>

      {/* ハンバーガーメニュー（モバイル用） */}
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-white border-2 border-white"
            >
              <Menu size={26} />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className={clsx(
              "flex flex-col bg-gray-100",
              gradient && "bg-gradient-to-b",
              gradient,
              "[&_[data-radix-sheet-close]]:w-10 [&_[data-radix-sheet-close]]:h-10",
              "[&_[data-radix-sheet-close]_svg]:w-6 [&_[data-radix-sheet-close]_svg]:h-6"
            )}
          >
            <SheetHeader className="pt-4 px-4">
              <SheetTitle className="text-center text-xl text-white">
                Menu
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 flex flex-col justify-center items-center space-y-4 text-center">
              <Link href="/products" onClick={() => setOpen(false)} className="text-lg text-white">Work</Link>
              <Link href="/staffs" onClick={() => setOpen(false)} className="text-lg text-white">Staffs</Link>
              <Link href="/menu" onClick={() => setOpen(false)} className="text-lg text-white">Price</Link>
              <Link href="/stores" onClick={() => setOpen(false)} className="text-lg text-white">Access</Link>
              <Link href="/about" onClick={() => setOpen(false)} className="text-lg text-white">Our Vision</Link>
              <Link href="/news" onClick={() => setOpen(false)} className="text-lg text-white">Notice</Link>
              <Link href="mailto:noas.nolife1203@gmail.com" className="hover:underline text-white">Contact</Link>
              <Link href="/jobApp" onClick={() => setOpen(false)} className="text-lg text-white">Careers</Link>
            </div>

            {/* ログインエリア */}
            <div className="p-4 space-y-4">
              {isLoggedIn && (
                <>
                  <Link href="/postList" onClick={() => setOpen(false)} className={clsx("block text-center text-lg", gradient ? "text-white" : "text-black")}>タイムライン</Link>
                  <Link href="/community" onClick={() => setOpen(false)} className={clsx("block text-center text-lg", gradient ? "text-white" : "text-black")}>コミュニティ</Link>
                  <Link href="/analytics" onClick={() => setOpen(false)} className={clsx("block text-center text-lg", gradient ? "text-white" : "text-black")}>分析</Link>
                </>
              )}
              <Link href="/login" onClick={() => setOpen(false)} className={clsx("block text-center text-lg", gradient ? "text-white" : "text-black")}>Administrator Login</Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
