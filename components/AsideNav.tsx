"use client";

import Link from "next/link";
import { LayoutDashboard, ListTodo, GitCompare, User, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

function AsideNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuthUser();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/issues", icon: ListTodo, label: "Issues" },
    { href: "/compare", icon: GitCompare, label: "Compare" },
    { href: "/profile", icon: User, label: "Profile" },
    ...(isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <div className="hidden desktop:flex bg-card border-r border-border-zinc/60 flex-col w-fit min-h-full p-8 text-white">
      <nav className="flex flex-col gap-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-emerald-normal/20 to-cyan-normal/20 text-emerald-light"
                  : "text-white hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AsideNav;
