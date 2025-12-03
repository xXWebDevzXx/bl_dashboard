"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import Link from "next/link";

function Header() {
  const { user, isLoading } = useAuthUser();

  return (
    <header className="bg-[#1A1F26] flex justify-between items-center text-white p-8 col-span-2">
      <Link href="/dashboard" className="text-4xl font-bold">AITracker</Link>
      {!isLoading && (user ? <LogoutButton /> : <LoginButton />)}
    </header>
  );
}

export default Header;
