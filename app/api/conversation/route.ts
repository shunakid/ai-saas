import { auth as authenticateUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const openAIConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAIApiInstance = new OpenAIApi(openAIConfiguration);

export async function POST(req: Request) {
  try {
    const { userId } = authenticateUser();
    const requestBody = await req.json();
    const { messages: userMessages } = requestBody;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openAIConfiguration.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!userMessages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const openAIResponse = await openAIApiInstance.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: userMessages,
    });

    return NextResponse.json(openAIResponse.data.choices[0].message);
  } catch (error) {
    console.error("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
