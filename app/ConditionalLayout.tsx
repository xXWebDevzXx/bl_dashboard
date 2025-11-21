"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import AsideNav from "@/components/AsideNav";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isAuthDemoPage = pathname === "/auth-demo";

  if (isLoginPage || isAuthDemoPage) {
    return <>{children}</>;
  }

  return (
    <div className="grid grid-rows-[auto_1fr] grid-cols-[auto_1fr] min-h-screen">
      <Header />
      <AsideNav />
      <main className="flex-1 bg-[#161B21]">{children}</main>
    </div>
  );
}
