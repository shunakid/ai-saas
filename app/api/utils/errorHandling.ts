import { NextResponse } from "next/server";
import { z } from "zod";

import { openAIConfiguration } from "../utils/openAIConfig";

/**
 * zodを使用して、HandleErrorsParamsのスキーマを定義します。
 */
const HandleErrorsParamsSchema = z.object({
  userId: z.union([z.string(), z.null()]),
  conversationHistory: z.array(z.string()).optional(),
  prompt: z.string().optional(),
  requiredFields: z.record(z.union([z.string(), z.number()])).optional(),
  freetrial: z.boolean().optional(),
});

/**
 * zodの型推論を使用して、HandleErrorsParamsの型を定義します。
 */
type HandleErrorsParams = z.infer<typeof HandleErrorsParamsSchema>;

function handleErrors(params: HandleErrorsParams) {
  const { userId, requiredFields, freetrial } = params;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!openAIConfiguration.apiKey) {
    return new NextResponse("OpenAI API Key not configured.", {
      status: 500,
    });
  }

  if (!freetrial) {
    return new NextResponse("API Limit Exceeded", { status: 403 });
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
