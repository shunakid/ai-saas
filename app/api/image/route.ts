import { NextResponse } from "next/server";

import { openAIApiInstance } from "../utils/openAIConfig";
import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId, body } = await handleRequest(req);
    const { prompt, amount = 1, resolution = "512x512" } = body;

    const errorResponse = handleErrors({
      userId,
      requiredFields: { prompt, amount, resolution },
    });
    if (errorResponse) return errorResponse;

    const openAIResponse = await openAIApiInstance.createImage({
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });

    return NextResponse.json(openAIResponse.data.data);
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
