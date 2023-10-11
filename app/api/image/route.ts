import { NextResponse } from "next/server";

import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";

import { openAIApiInstance } from "../utils/openAIConfig";
import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";

/**
 * POSTリクエストを処理する非同期関数。
 * ユーザーのリクエストを受け取り、OpenAIのAPIを呼び出して画像を生成し、結果を返す。
 * APIの制限回数を確認し、エラーハンドリングも行う。
 *
 * @async
 * @function
 * @param {Request} req - 受け取ったリクエスト
 * @returns {Promise<NextResponse>} OpenAIのAPIからの画像データまたはエラーメッセージ
 * @throws 500のステータスコードとともに内部エラーメッセージを返す
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // リクエストからユーザーIDと本文を取得
    const { userId, body } = await handleRequest(req);
    // 本文からプロンプト、数量、解像度を取得
    const { prompt, amount = 1, resolution = "512x512" } = body;

    // APIの制限回数を確認
    const freetrial = await checkApiLimit();

    // 必要なフィールドとともにエラーハンドリング
    const errorResponse = handleErrors({
      userId,
      freetrial,
      requiredFields: { prompt, amount, resolution },
    });
    if (errorResponse) return errorResponse;

    // OpenAIのAPIを呼び出して画像を生成
    const openAIResponse = await openAIApiInstance.createImage({
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });

    // APIの制限回数を増やす
    await incrementApiLimit();

    // OpenAIのAPIからの画像データを返す
    return NextResponse.json(openAIResponse.data.data);
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
