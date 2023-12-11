import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  // リクエストから本文とStripeシグネチャを取得
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    // Stripe Webhookイベントを構築
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    // Webhookの検証エラー時に400エラーを返す
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Stripeのチェックアウトセッションオブジェクトを取得
  const session = event.data.object as Stripe.Checkout.Session;

  // チェックアウトセッションが完了した場合の処理
  if (event.type === "checkout.session.completed") {
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // ユーザーIDが存在しない場合は400エラーを返す
    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    // ユーザーサブスクリプションデータをデータベースに保存
    await prismadb.userSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      },
    });
  }

  // インボイスの支払い成功時の処理
  if (event.type === "invoice.payment_succeeded") {
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // ユーザーサブスクリプションデータを更新
    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      },
    });
  }

  // 正常に処理された場合は200ステータスを返す
  return new NextResponse(null, { status: 200 });
}
