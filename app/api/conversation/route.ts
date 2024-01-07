import { NextResponse } from "next/server";

import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { saveConversation } from "@/lib/conversation";

import { openAIApiInstance } from "../utils/openAIConfig";
import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";

export const maxDuration = 300;
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // リクエストからユーザーIDとメッセージを取得
    const { userId, body } = await handleRequest(req);
    const { messages: conversationHistory } = body; // ここまではフロントエンドの最新の会話履歴

    // APIの制限回数を確認
    const freetrial = await checkApiLimit();

    // エラーハンドリング
    const errorResponse = handleErrors({
      userId,
      conversationHistory,
      freetrial,
    });
    if (errorResponse) return errorResponse;

    // このOpenAIのAPIの呼び出しで、応答が追加される。
    const openAIResponse = await openAIApiInstance.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
    });

    // ここで最新の会話履歴を保存する
    saveConversation(userId, openAIResponse);

    // APIの制限回数を増やす
    await incrementApiLimit();

    return NextResponse.json(openAIResponse.data.choices[0].message);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
