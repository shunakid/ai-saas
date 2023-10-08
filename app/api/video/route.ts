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
      "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f",
      {
        input: {
          motion_module: "mm_sd_v14",
          prompt: prompt,
        },
      },
    );

    await incrementApiLimit();

    return NextResponse.json(response);
  } catch (error) {
    console.log("[VIDEO_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
