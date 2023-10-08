import { PrismaClient } from "@prisma/client";

/**
 * グローバル変数としてPrismaClientのインスタンスを宣言します。
 * この変数は、データベースへの接続やクエリの実行に使用されるPrismaClientのインスタンスを保持します。
 * @global
 * @type {PrismaClient | undefined}
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * グローバル変数prismaが未定義の場合、新しいPrismaClientのインスタンスを作成します。
 * すでに存在する場合は、そのインスタンスを再利用します。
 * @type {PrismaClient}
 */
const prismadb = global.prisma || new PrismaClient();

/**
 * 開発環境の場合、グローバル変数prismaにprismadbのインスタンスを代入します。
 * これにより、開発中に同じPrismaClientインスタンスを再利用することができ、
 * パフォーマンスの向上や接続の再利用が可能となります。
 */
if (process.env.NODE_ENV === "development") global.prisma = prismadb;

/**
 * PrismaClientのインスタンスをエクスポートします。
 * このインスタンスを使用して、アプリケーションの他の部分からデータベースにアクセスできます。
 */
export default prismadb;
