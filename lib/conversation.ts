import prismadb from "./prismadb";

// 会話履歴をデータベースに保存し、最新の会話履歴を返却する関数
export async function saveConversation(
  userId: any,
  apiResponse: any,
  conversationHistory: any,
) {
  // 最新の会話履歴を取得
  const botResponse = apiResponse.data.choices[0].message;

  let updatedConversationHistory;

  // ユーザーIDに基づいて既存の会話を検索
  const existingConversation = await prismadb.conversation.findUnique({
    where: { userId: userId },
  });

  if (existingConversation) {
    // 既存の会話がある場合は、会話履歴を更新
    const updatedConversation = await prismadb.conversation.update({
      where: { id: existingConversation.id },
      data: {
        conversationHistory: conversationHistory,
      },
    });
    updatedConversationHistory = updatedConversation.conversationHistory;
  } else {
    // 会話が存在しない場合は、新しい会話を作成
    const newConversation = await prismadb.conversation.create({
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
