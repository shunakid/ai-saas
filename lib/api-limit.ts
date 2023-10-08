import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";

/**
 * ユーザーIDを取得するヘルパー関数
 * @returns {string|null}
 */
const getUserId = () => {
  const { userId } = auth();
  return userId || null;
};

/**
 * ユーザーのAPI制限回数をデータベースから取得するヘルパー関数
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getUserApiLimit = async (userId: string) => {
  return await prismadb.userApiLimit.findUnique({
    where: { userId },
  });
};

/**
 * ユーザーのAPI制限回数を増やす関数。
 * ユーザーが存在し、そのユーザーのAPI制限回数がデータベースに存在する場合は、その回数を1増やしてデータベースを更新する。
 * 存在しない場合は、データベースに新たにレコードを作成し、回数を1として保存する。
 * @async
 * @function
 * @returns {Promise<void>}
 */
export const incrementApiLimit = async () => {
  const userId = getUserId();
  if (!userId) return;

  const userApiLimit = await getUserApiLimit(userId);

  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: { userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { userId, count: 1 },
    });
  }
};

/**
 * ユーザーのAPI制限回数が最大無料回数を超えていないかを確認する関数。
 * ユーザーが存在し、そのユーザーのAPI制限回数がデータベースに保存されている場合、その回数が最大無料回数未満かどうかを確認する。
 * レコードが存在しない場合や、回数が最大無料回数未満の場合はtrueを返す。
 * それ以外の場合はfalseを返す。
 * @async
 * @function
 * @returns {Promise<boolean>}
 */
export const checkApiLimit = async () => {
  const userId = getUserId();
  if (!userId) return false;

  const userApiLimit = await getUserApiLimit(userId);

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

/**
 * ユーザーのAPI制限回数をデータベースから取得する関数。
 * ユーザーが存在しない、またはそのユーザーのAPI制限回数のレコードがデータベースに存在しない場合は0を返す。
 * それ以外の場合は、そのユーザーのAPI制限回数を返す。
 * @async
 * @function
 * @returns {Promise<number>}
 */
export const getApiLimitCount = async () => {
  const userId = getUserId();
  if (!userId) return 0;

  const userApiLimit = await getUserApiLimit(userId);

  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};
