import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000; // 1日のミリ秒数

// ユーザーのサブスクリプション状態をチェックする関数
export const checkSubscription = async () => {
  // 現在のユーザーの認証情報からユーザーIDを取得
  const { userId } = auth();

  // ユーザーIDが存在しない場合は、サブスクリプションが無効であると判断
  if (!userId) {
    return false;
  }

  // データベースからユーザーのサブスクリプション情報を取得
  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  // ユーザーのサブスクリプション情報が存在しない場合は、無効と判断
  if (!userSubscription) {
    return false;
  }

  // サブスクリプションが有効かどうかを判断
  // 有効であるためには、価格IDが存在し、現在の期間の終了時間が現在時刻よりも未来である必要がある
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  // サブスクリプションの有効性に基づいてブール値を返す
  return !!isValid;
};
