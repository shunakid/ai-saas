import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  // Clerkのダッシュボードから取得したWebhookシークレットキー
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // シークレットキーが設定されていない場合はエラー
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // ヘッダーからWebhook関連の情報を取得
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // 必要なヘッダーが欠けている場合はエラーレスポンスを返す
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // リクエストボディを取得し、JSON形式に変換
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Webhookインスタンスを作成
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // ヘッダー情報を使用してペイロードの検証を試みる
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // イベントタイプを取得
  const eventType = evt.type;

  // セッション作成イベントの場合、データベースにユーザー情報を登録
  if (eventType === "session.created") {
    await prismadb.user.create({
      data: {
        user_id: payload.data.user_id,
      },
    });
  }

  // 処理が正常に完了した場合、空のレスポンスを返す
  return new Response("", { status: 200 });
}
