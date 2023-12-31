import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// この例では、api/trpc ルートを含む全てのルートを保護します。
// 必要に応じて、他のルートを公開として設定してください。
// ミドルウェアの設定についての詳細は https://clerk.com/docs/references/nextjs/auth-middleware を参照してください。
export default authMiddleware({
  afterAuth(auth, req) {
    // 認証されていないユーザーを処理する
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // ユーザーがログインしており、保護されたルートにアクセスしようとしている場合は、ルートにアクセスさせる
    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }
    // 公開ルートを訪れているユーザーには、アクセスを許可する
    return NextResponse.next();
  },
  publicRoutes: ["/", "/api/webhook", "/api/webhooks(.*)"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
