import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用例:

// 1. 基本的な使用法:
// const className = cn('text-red-500', 'bg-blue-200');
// console.log(className); // 'text-red-500 bg-blue-200'

// 2. 条件付きクラスの追加:
// const isActive = true;
// const className = cn('text-red-500', isActive && 'bg-blue-200');
// console.log(className); // 'text-red-500 bg-blue-200'

// 3. クラスの競合を解消:
// const className = cn('px-4', 'px-6', 'bg-green-300');
// console.log(className); // 'px-6 bg-green-300'

// 4. オブジェクトを使用して条件付きクラスを追加:
// const isDisabled = false;
// const className = cn({
//   'text-red-500': true,
//   'bg-gray-200': isDisabled
// });
// console.log(className); // 'text-red-500'

// 5. 配列を使用してクラスを結合:
// const baseClasses = ['text-red-500', 'bg-blue-200'];
// const className = cn(baseClasses, 'px-4');
// console.log(className); // 'text-red-500 bg-blue-200 px-4'
