import { NextResponse } from "next/server";

import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";

import { handleRequest } from "../utils/requestHandler";
import { handleErrors } from "../utils/errorHandling";
import { replicateAIConfiguration } from "../utils/ReplicateAIConfig";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId, body } = await handleRequest(req);
    const { prompt } = body;

    const errorResponse = handleErrors({ userId, prompt });
    if (errorResponse) return errorResponse;

    const freetrial = await checkApiLimit();
    if (!freetrial) {
      return new NextResponse("API Limit Exceeded", { status: 403 });
    }

    const response = await replicateAIConfiguration.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: prompt,
        },
      },
    );

    await incrementApiLimit();

    return NextResponse.json(response);
  } catch (error) {
    console.log("[MUSIC_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
