import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage } from "openai";

import { openAIApiInstance } from "../utils/openAIConfig";
import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";

const instructionMessage: ChatCompletionRequestMessage = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
};

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId, body } = await handleRequest(req);
    const { messages: userMessages } = body;

    const errorResponse = handleErrors({ userId, userMessages });
    if (errorResponse) return errorResponse;

    const openAIResponse = await openAIApiInstance.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [instructionMessage, ...userMessages],
    });

    return NextResponse.json(openAIResponse.data.choices[0].message);
  } catch (error) {
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}