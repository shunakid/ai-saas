import { PrismaClient } from "@prisma/client";

/**
 * グローバル変数としてPrismaClientのインスタンスを宣言します。
 * @global
 * @type {PrismaClient | undefined}
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * グローバル変数prismaが存在しない場合、新しいPrismaClientのインスタンスを作成します。
 * @type {PrismaClient}
 */
const prismadb = global.prisma || new PrismaClient();

/**
 * 開発環境の場合、グローバル変数prismaにprismadbを代入します。
 * これにより、開発中に同じPrismaClientインスタンスを再利用することができます。
 */
if (process.env.NODE_ENV === "development") global.prisma = prismadb;

export default prismadb;
