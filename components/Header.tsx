"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import {
  GitCompare,
  LayoutDashboard,
  ListTodo,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

function Header() {
  const { user, isLoading, isAdmin } = useAuthUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/issues", icon: ListTodo, label: "Issues" },
    { href: "/compare", icon: GitCompare, label: "Compare" },
    { href: "/profile", icon: User, label: "Profile" },
    ...(isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <>
      <header className="bg-card border-b border-border-zinc/60 flex justify-between items-center text-white p-4 sm:p-6 desktop:p-8 col-span-full desktop:col-span-2">
        <Link href="/dashboard" className="flex items-center group ">
          
          <svg width="56" height="56" viewBox="0 0 139 133" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-gradient-2" x1="0" y1="0" x2="139" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" style={{ stopColor: "var(--emerald-light)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "var(--cyan-light)", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <g fill="url(#logo-gradient-2)">
              <path d="M130.653 2.15015L108.153 23.1502C115.514 119.402 75.5144 108.148 6.15298 112.65L6.15298 130.65L41.657 130.851C109.334 130.851 146.978 97.4487 130.653 2.15015Z" />
              <path d="M130.653 2.15015L109.153 23.65C12.6563 21.0346 27.2359 61.1518 26.153 130.65L6.15295 130.65L5.88781 97.0106C2.55701 29.4165 34.6669 -9.46459 130.653 2.15015Z" />
            </g>
          </svg>

          <span className="text-2xl sm:text-3xl desktop:text-4xl font-bold bg-gradient-to-r from-emerald-light p-2 to-cyan-light bg-clip-text text-transparent group-hover:from-emerald-light group-hover:to-cyan-light transition-all">Delegate</span>
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
            <button onClick={toggleMenu} className="desktop:hidden p-2 hover:bg-zinc-800 rounded-md transition-colors" aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && <div className="desktop:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={toggleMenu} />}

      {/* Mobile Menu Dropdown */}
      <div className={`desktop:hidden fixed top-0 right-0 bottom-0 w-64 h-screen bg-card border-l border-border-zinc/60 z-40 transform transition-all duration-300 ease-in-out ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
        <nav className="flex flex-col p-6 pt-20">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={toggleMenu} className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === href ? "bg-gradient-to-r from-emerald-normal/20 to-cyan-normal/20 text-emerald-light" : "text-white hover:bg-zinc-800"}`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}

          {/* Logout button in mobile menu */}
          <div className="mt-6 pt-6 border-t border-border-zinc flex justify-center">
            <LogoutButton />
          </div>
        </nav>
      </div>
    </>
  );
}

export default Header;
