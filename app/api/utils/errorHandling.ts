import { NextResponse } from "next/server";
import { z } from "zod";

import { openAIConfiguration } from "../utils/openAIConfig";

/**
 * HandleErrorsParamsSchema は、handleErrors 関数のパラメータの期待される形状を
 * Zod スキーマを使用して定義します。
 *
 * @typedef {Object} HandleErrorsParams
 * @property {string | null} userId - ユーザーのID。
 * @property {string[] | undefined} userMessages - ユーザーメッセージのオプションの配列。
 * @property {string | undefined} prompt - オプションのプロンプト文字列。
 * @property {Record<string, string | number> | undefined} requiredFields - 必須フィールドのオプションのオブジェクト。
 */
const HandleErrorsParamsSchema = z.object({
  userId: z.string().nullable(),
  userMessages: z.array(z.string()).optional(),
  prompt: z.string().optional(),
  requiredFields: z.record(z.union([z.string(), z.number()])).optional(),
});

/**
 * handleErrors 関数は、HandleErrorsParamsSchema に対してパラメータを検証し、
 * 検証されたパラメータに基づいてエラーハンドリングを実行します。
 *
 * @function
 * @param {unknown} params - 検証および処理されるパラメータ。
 * @returns {NextResponse | null} - エラーが発生した場合は NextResponse オブジェクトを返し、それ以外の場合は null を返します。
 */
function handleErrors(params: unknown) {
  // HandleErrorsParamsSchema に対して params を検証します
  const parsedParams = HandleErrorsParamsSchema.safeParse(params);

  // params がスキーマに適合しない場合、エラーレスポンスを返します
  if (!parsedParams.success) {
    return new NextResponse("Invalid parameters", { status: 400 });
  }

  // 検証された params を分割代入します
  const { userId, requiredFields } = parsedParams.data;

  // userId が存在しない場合、未認証のレスポンスを返します
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // OpenAI API Key が設定されていない場合、内部サーバーエラーレスポンスを返します
  if (!openAIConfiguration.apiKey) {
    return new NextResponse("OpenAI API Key not configured.", {
      status: 500,
    });
  }

  // 必須フィールドが欠落している場合、不正なリクエストレスポンスを返します
  if (requiredFields) {
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return new NextResponse(`${field} is required`, { status: 400 });
      }
    }
  }

  // エラーが発生しない場合、null を返します
  return null;
}

export { handleErrors };
