"use client";

import AsideNav from "@/components/AsideNav";
import Header from "@/components/Header";
import { useAuthUser } from "@/hooks/useAuthUser";
import { usePathname } from "next/navigation";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthUser();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isAuthDemoPage = pathname === "/auth-demo";
  const isRegisterPage = pathname === "/register";

  if (isLoginPage || isAuthDemoPage || isRegisterPage || !user) {
    return <>{children}</>;
  }

  return (
    <div className="grid grid-rows-[auto_1fr] desktop:grid-cols-[auto_1fr] min-h-screen">
      <Header />
      <AsideNav />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
