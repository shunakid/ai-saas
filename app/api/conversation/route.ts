import { NextResponse } from "next/server";

import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";

import { openAIApiInstance } from "../utils/openAIConfig";
import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";

/**
 * POSTリクエストを処理する非同期関数。
 * ユーザーのリクエストを受け取り、OpenAIのAPIを呼び出して結果を返す。
 * APIの制限回数を確認し、エラーハンドリングも行う。
 *
 * @async
 * @function
 * @param {Request} req - 受け取ったリクエスト
 * @returns {Promise<NextResponse>} OpenAIのAPIからのレスポンスまたはエラーメッセージ
 * @throws 500のステータスコードとともに内部エラーメッセージを返す
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // リクエストからユーザーIDとメッセージを取得
    const { userId, body } = await handleRequest(req);
    const { messages: userMessages } = body;

    // APIの制限回数を確認
    const freetrial = await checkApiLimit();

    // エラーハンドリング
    const errorResponse = handleErrors({ userId, userMessages, freetrial });
    if (errorResponse) return errorResponse;

    // OpenAIのAPIを呼び出し
    const openAIResponse = await openAIApiInstance.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: userMessages,
    });

    // APIの制限回数を増やす
    await incrementApiLimit();

    // OpenAIのAPIからのレスポンスを返す
    return NextResponse.json(openAIResponse.data.choices[0].message);
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
