import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard Page ( 保護されたページ )</h1>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default DashboardPage;
