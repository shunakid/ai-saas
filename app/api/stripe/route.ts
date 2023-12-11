import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    // 現在のユーザーの認証情報を取得
    const { userId } = auth();
    const user = await currentUser();

    // ユーザーIDまたはユーザーオブジェクトが存在しない場合、未認証として401を返す
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // ユーザーのサブスクリプション情報をデータベースから取得
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    // 既存のサブスクリプションとStripeの顧客IDがある場合、請求ポータルセッションを作成
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      // StripeセッションのURLをレスポンスとして返す
      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    // Stripeのチェックアウトセッションを作成する関数
    const stripeSession = await stripe.checkout.sessions.create({
      // 支払い完了後にユーザーをリダイレクトするURL
      success_url: settingsUrl,

      // 支払いをキャンセルした場合にユーザーをリダイレクトするURL
      cancel_url: settingsUrl,

      // 使用可能な支払い方法（ここではクレジットカードのみ）
      payment_method_types: ["card"],

      // セッションのモード（ここではサブスクリプションを意味する）
      mode: "subscription",

      // 請求先住所の収集方法（自動で収集する設定）
      billing_address_collection: "auto",

      // 顧客のメールアドレス（ユーザーオブジェクトから取得）
      customer_email: user.emailAddresses[0].emailAddress,

      // 購入する商品の詳細
      line_items: [
        {
          // 商品の価格情報
          price_data: {
            // 通貨の設定（日本円）
            currency: "JPY",

            // 商品データ（名前と説明）
            product_data: {
              name: "AI hub Pro",
              description: "使用回数が無制限になります。",
            },

            // 単位あたりの価格（2000円）
            unit_amount: 2000,

            // 定期購読の設定（毎月）
            recurring: {
              interval: "month",
            },
          },
          // 購入する数量（1つ）
          quantity: 1,
        },
      ],

      // 追加のメタデータ（ここではユーザーIDを含む）
      metadata: {
        userId,
      },
    });

    // この関数は最終的にStripeのチェックアウトページのURLを生成し、
    // ユーザーはこのURLを使用してサブスクリプションを購入できます。

    // 新規チェックアウトセッションのURLをレスポンスとして返す
    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    // エラーが発生した場合、コンソールにエラーを出力し、500のステータスコードを返す
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
