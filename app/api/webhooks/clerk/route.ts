import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  // Clerkのダッシュボードから取得したWebhookシークレットキーを取得
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // シークレットキーが設定されていない場合はエラーを投げる
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // リクエストヘッダーからWebhook関連の情報を取得
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

  // リクエストボディをJSON形式で取得
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Webhookインスタンスを初期化
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // ヘッダー情報を使用してペイロードを検証
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

  // Webhookイベントのタイプを取得
  const eventType = evt.type;

  // セッション作成イベントが発生した場合の処理
  if (eventType === "session.created") {
    const userId = payload.data.user_id;

    // Clerkからユーザー情報を取得
    const clerkUser = await clerkClient.users.getUser(userId);

    // Prismaを使用してユーザー情報を保存または更新
    await prismadb.user.upsert({
      where: { userid: userId },
      create: {
        userid: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        emailAddresses: clerkUser.primaryEmailAddressId
          ? JSON.stringify(clerkUser.primaryEmailAddressId)
          : { set: null },
      },
      update: {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        emailAddresses: clerkUser.primaryEmailAddressId
          ? JSON.stringify(clerkUser.primaryEmailAddressId)
          : { set: null },
      },
    });
  }

  // 処理が正常に完了した場合、空のレスポンスを返す
  return new Response("", { status: 200 });
}
