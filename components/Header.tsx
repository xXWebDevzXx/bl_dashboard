"use client";

import { useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import { LayoutDashboard, ListTodo, GitCompare, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

function Header() {
  const { user, isLoading } = useAuthUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/issues", icon: ListTodo, label: "Issues" },
    { href: "/compare", icon: GitCompare, label: "Compare" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      <header className="bg-[#161B22] border-b border-zinc-800/60 flex justify-between items-center text-white p-4 sm:p-6 desktop:p-8 col-span-full desktop:col-span-2">
        <Link href="/dashboard" className="text-2xl sm:text-3xl desktop:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-cyan-300 transition-all">
          AITracker
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop logout button */}
          {!isLoading && user && (
            <div className="hidden desktop:block">
              <LogoutButton />
            </div>
          )}
          {!isLoading && !user && <LoginButton />}

          {/* Mobile burger menu button */}
          {user && (
            <button
              onClick={toggleMenu}
              className="desktop:hidden p-2 hover:bg-zinc-800 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="desktop:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu Dropdown */}
      <div
        className={`desktop:hidden fixed top-0 right-0 bottom-0 w-64 h-screen bg-[#161B22] border-l border-zinc-800/60 z-40 transform transition-all duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <nav className="flex flex-col p-6 pt-20">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={toggleMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                pathname === href
                  ? "bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 text-emerald-400"
                  : "text-white hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}

          {/* Logout button in mobile menu */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <LogoutButton />
          </div>
        </nav>
      </div>
    </>
  );
}

export default Header;
