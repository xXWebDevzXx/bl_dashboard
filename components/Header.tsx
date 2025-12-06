"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import Link from "next/link";

function Header() {
  const { user, isLoading } = useAuthUser();

  return (
    <header className="bg-[#161B22] border-b border-zinc-800/60 flex justify-between items-center text-white p-8 col-span-2">
      <Link href="/dashboard" className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-cyan-300 transition-all">AITracker</Link>
      {!isLoading && (user ? <LogoutButton /> : <LoginButton />)}
    </header>
  );
}

export default Header;
