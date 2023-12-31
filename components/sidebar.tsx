"use client";

import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessagesSquare,
  Music,
  Settings,
  VideoIcon,
} from "lucide-react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { FreeCounter } from "./free-counter";

// Montserratフォントの設定
const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

// サイドバーに表示されるナビゲーションリンクの情報を持つ配列
const routes = [
  {
    label: "ダッシュボード",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "会話",
    icon: MessagesSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    label: "画像",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-500",
  },
  {
    label: "動画",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-500",
  },
  {
    label: "音楽",
    icon: Music,
    href: "/music",
    color: "text-emerald-500",
  },
  {
    label: "コード",
    icon: Code,
    href: "/code",
    color: "text-yellow-500",
  },
  {
    label: "設定",
    icon: Settings,
    href: "/settings",
  },
];

interface SidebarProps {
  apiLimitCount: number;
}

export const Sidebar = ({
  apiLimitCount = 0,
  isPro = false,
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col space-y-4 bg-[#111827] py-4 text-white">
      <div className="flex-1 px-3 py-2">
        <Link href="/dashboard" className="mb-14 flex items-center pl-3">
          <div className=" relative mr-4 h-8 w-8">
            <Image fill alt="Logo" src="/logo.png" />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            AI hub
          </h1>
        </Link>
        <div className=" space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                // 基本のスタイルを設定
                "group flex w-full cursor-pointer justify-start rounded-lg p-3 text-sm font-medium transition hover:bg-white/10 hover:text-white",

                // 現在のページのパスに基づいて、リンクの背景色とテキスト色を動的に変更
                pathname === route.href
                  ? "bg-white/10 text-white" // 現在のページの場合のスタイル
                  : "text-zinc-400", // それ以外のページの場合のスタイル
              )}
            >
              <div className="flex flex-1 items-center">
                <route.icon className={cn("mr-3 h-5 w-5", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <FreeCounter isPro={isPro} apiLimitCount={apiLimitCount} />{" "}
    </div>
  );
};

export default Sidebar;
