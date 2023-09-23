import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

// OpenAI APIの設定
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI APIと通信するためのインスタンスを作成。
const openai = new OpenAIApi(configuration);

// ユーザーからのチャットリクエストを処理し、OpenAI APIに転送し、結果をクライアントに返す。
export async function POST(req: Request) {
  try {
    // 現在認証されているユーザーのIDを含むオブジェクトを取得
    const { userId } = auth();
    // ユーザーの送信したメッセージが入ったリクエストをJSON形式にデシリアライズ
    const body = await req.json();
    // ユーザーの送信したメッセージをリクエストから抽出。
    const { messages } = body;

    // NextResponseによるエラーハンドリング
    // 認証されていないユーザーのアクセスを防ぐ
    if (!userId)
      return new NextResponse("Unauthorized: User is not authenticated", {
        status: 401,
      });

    // APIキーが設定されていない場合のアクセスを防ぐ
    if (!configuration.apiKey)
      return new NextResponse("Unauthorized: API key is missing", {
        status: 401,
      });

    // メッセージが存在しない場合のリクエストを防ぐ
    if (!messages)
      return new NextResponse("Bad Request: Message is required", {
        status: 400,
      });

    // OpenAI APIにユーザーが送信したテキストを転送し、レスポンスを取得
    const chatResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });
    // OpenAI APIからのレスポンスをクライアントにJSON形式にシリアライズして返す
    return NextResponse.json(chatResponse.data.choices[0].message);

    // エラーハンドリング
    // NextResponseによるエラーハンドリングで処理されなかったエラーをキャッチ
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
