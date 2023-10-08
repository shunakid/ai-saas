import { NextResponse } from "next/server";
import { z } from "zod";

import { openAIConfiguration } from "../utils/openAIConfig";

/**
 * zodを使用して、HandleErrorsParamsのスキーマを定義します。
 */
const HandleErrorsParamsSchema = z.object({
  userId: z.union([z.string(), z.null()]),
  userMessages: z.array(z.string()).optional(),
  prompt: z.string().optional(),
  requiredFields: z.record(z.union([z.string(), z.number()])).optional(),
});

/**
 * zodの型推論を使用して、HandleErrorsParamsの型を定義します。
 */
type HandleErrorsParams = z.infer<typeof HandleErrorsParamsSchema>;

/**
 * エラーをハンドリングする関数。
 * 1. ユーザーIDが存在しない場合、401のステータスコードで"Unauthorized"というレスポンスを返します。
 * 2. OpenAIのAPIキーが設定されていない場合、500のステータスコードでエラーメッセージを返します。
 * 3. 必須フィールドが存在し、そのフィールドの値が存在しない場合、400のステータスコードでエラーメッセージを返します。
 * 上記の条件に一致しない場合、nullを返します。
 *
 * @param {HandleErrorsParams} params - エラーハンドリングのためのパラメータ。
 * @returns {NextResponse | null} - エラーレスポンスまたはnull。
 */
function handleErrors(params: HandleErrorsParams) {
  const { userId, requiredFields } = params;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!openAIConfiguration.apiKey) {
    return new NextResponse("OpenAI API Key not configured.", {
      status: 500,
    });
  }

  if (requiredFields) {
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return new NextResponse(`${field} is required`, { status: 400 });
      }
    }
  }

  return null;
}

export { handleErrors };
