import { NextResponse } from "next/server";

import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";

import { openAIApiInstance } from "../utils/openAIConfig";
import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId, body } = await handleRequest(req);
    const { messages: userMessages } = body;

    const errorResponse = handleErrors({ userId, userMessages });
    if (errorResponse) return errorResponse;

    const freetrial = await checkApiLimit();
    if (!freetrial) {
      return new NextResponse("API Limit Exceeded", { status: 403 });
    }

    const openAIResponse = await openAIApiInstance.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: userMessages,
    });

    await incrementApiLimit();

    return NextResponse.json(openAIResponse.data.choices[0].message);
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
