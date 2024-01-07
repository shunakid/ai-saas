import prismadb from "./prismadb";

export async function saveConversation(userId: any, apiResponse: any) {
  // 最新の会話履歴
  const botResponse = apiResponse.data.choices[0].message;

  // 既存の会話を検索
  const existingConversation = await prismadb.conversation.findUnique({
    where: { userId: userId },
  });

  if (existingConversation) {
    // 既存の会話がある場合は、会話履歴を更新
    await prismadb.conversation.update({
      where: { id: existingConversation.id },
      data: {
        conversationHistory: botResponse,
      },
    });
  } else {
    // 会話が存在しない場合は、新しい会話を作成
    await prismadb.conversation.create({
      data: {
        conversationHistory: botResponse,
        user: {
          connect: {
            userId: userId,
          },
        },
      },
    });
  }
}
