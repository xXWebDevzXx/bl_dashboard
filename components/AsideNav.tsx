"use client";

import Link from "next/link";
import { LayoutDashboard, ListTodo, GitCompare, User } from "lucide-react";
import { usePathname } from "next/navigation";

function AsideNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/issues", icon: ListTodo, label: "Issues" },
    { href: "/compare", icon: GitCompare, label: "Compare" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="hidden desktop:flex bg-[#161B22] border-r border-zinc-800/60 flex-col w-fit min-h-full p-8 text-white">
      <nav className="flex flex-col gap-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex w-fit items-center gap-2 relative group after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-cyan-500 after:transition-all after:duration-300 ${
                isActive
                  ? "text-emerald-400 after:w-full"
                  : "after:w-0 hover:after:w-full"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors duration-300 ${
                isActive ? "text-emerald-400" : "group-hover:text-emerald-400"
              }`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AsideNav;
