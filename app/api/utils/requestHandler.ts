import { auth as authenticateUser } from "@clerk/nextjs";

/**
 * handleRequest 関数は、ユーザーの認証を行い、リクエストからJSONボディを抽出します。
 *
 * 1. ユーザーの認証を行い、認証されたユーザーのIDを取得します。
 * 2. 与えられたリクエストオブジェクトからJSONボディを抽出します。
 * 3. 認証されたユーザーのIDとJSONボディを含むオブジェクトを返します。
 *
 * @async
 * @function
 * @param {Request} req - 受け取るリクエストオブジェクト。
 * @returns {Promise<{ userId: string, body: any }>} - ユーザーIDとJSONボディを含むオブジェクトを返すPromise。
 * @throws エラーが発生した場合、エラーがスローされます。
 * @example
 * const { userId, body } = await handleRequest(req);
 */
async function handleRequest(req: Request) {
  // ユーザーを認証し、userIdを取得します。
  const { userId } = authenticateUser();

  // リクエストからJSONボディを抽出します。
  const body = await req.json();

  // userIdとbodyを含むオブジェクトを返します。
  return { userId, body };
}

export { handleRequest };
