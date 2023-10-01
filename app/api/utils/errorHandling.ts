import { NextResponse } from "next/server";

import { openAIConfiguration } from "../utils/openAIConfig";

interface HandleErrorsParams {
  userId: string | null;
  userMessages?: string[];
  requiredFields?: {
    [key: string]: string | number;
  };
}

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
