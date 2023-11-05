"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./sidebar";

export const MobileSidebar = ({
  apiLimitCount = 0,
}: {
  apiLimitCount: number;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <Sheet>
        <SheetTrigger>
          <Button asChild variant="ghost" size="icon" className=" md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar apiLimitCount={apiLimitCount} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
