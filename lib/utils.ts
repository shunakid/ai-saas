import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 複数のCSSクラスを組み合わせてマージする
// `clsx` はクラス名を結合し、`twMerge` はTailwind CSSクラスを適切にマージする
// inputs: 組み合わせたいクラス名の配列（可変長引数）
export function cn(...inputs: ClassValue[]) {
  // `clsx` でクラス名を結合し、その後 `twMerge` でTailwind CSSの重複を解消
  return twMerge(clsx(inputs));
}

// 指定されたパスに基づいて絶対URLを生成する
// process.env.NEXT_PUBLIC_APP_URL: 環境変数からアプリケーションのベースURLを取得
// path: ベースURLに追加するパス
export function absoluteUrl(path: string) {
  // 環境変数で定義されたベースURLと指定されたパスを結合して絶対URLを生成
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
