import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div>
      <h1>Landing Page ( 保護されていないページ )</h1>
      <div>
        <Button>
          <Link href="/sign-in">ログイン</Link>
        </Button>
        <Button>
          <Link href="/sign-up">新規登録</Link>
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
