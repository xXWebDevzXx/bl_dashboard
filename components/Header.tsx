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
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <svg width="40" height="40" viewBox="0 0 125 129" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="125" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" style={{ stopColor: 'var(--emerald-light)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'var(--cyan-light)', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <g fill="url(#logo-gradient)">
              <rect y="60" width="21" height="69" />
              <path d="M70 107L57.4961 129L-7.23232e-07 129L2.38418e-07 107L70 107Z" />
              <rect x="125" y="69" width="21" height="69" transform="rotate(-180 125 69)" />
              <path d="M55 22L67.5039 -1.99141e-06L125 7.22676e-06L125 22L55 22Z" />
              <path d="M67.5 1.14618e-05L55 22C41.8991 23.9552 27.0184 36.8439 21 60H0C4.44256 30.4839 33.5216 -0.0215865 67.5 1.14618e-05Z" />
              <path d="M57 129L69.5 107C82.6009 105.045 97.9816 92.1561 104 69L125 69C120.557 98.5161 90.9784 129.022 57 129Z" />
            </g>
          </svg>
          <span className="text-2xl sm:text-3xl desktop:text-4xl font-bold bg-gradient-to-r from-emerald-light p-2 to-cyan-light bg-clip-text text-transparent group-hover:from-emerald-light group-hover:to-cyan-light transition-all">
            Delegate
          </span>
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
