"use client";

import Link from "next/link";

export const LandingContent = () => {
  return (
    <div className="px-10 pb-20">
      <Link href="https://github.com/shunakid/ai-saas">
        <h2 className="mb-10 text-center text-2xl font-extrabold text-white">
          Github Link
        </h2>
      </Link>
    </div>
  );
};
