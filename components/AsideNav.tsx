import Link from "next/link";
import { LayoutDashboard, ListTodo, GitCompare, User } from "lucide-react";

function AsideNav() {
  return (
    <div className="bg-[#161B22] border-r border-zinc-800/60 flex flex-col w-fit min-h-full p-8 text-white">
      <nav className="flex flex-col gap-4">
        <Link href="/dashboard" className="flex w-fit items-center gap-2 relative group after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-cyan-500 hover:after:w-full after:transition-all after:duration-300">
          <LayoutDashboard className="w-4 h-4 transition-colors duration-300 group-hover:text-emerald-400" />
          Dashboard
        </Link>
        <Link href="/issues" className="flex w-fit items-center gap-2 relative group after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-cyan-500 hover:after:w-full after:transition-all after:duration-300">
          <ListTodo className="w-4 h-4 transition-colors duration-300 group-hover:text-emerald-400" />
          Issues
        </Link>
        <Link href="/compare" className="flex w-fit items-center gap-2 relative group after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-cyan-500 hover:after:w-full after:transition-all after:duration-300">
          <GitCompare className="w-4 h-4 transition-colors duration-300 group-hover:text-emerald-400" />
          Compare
        </Link>
        <Link href="/profile" className="flex w-fit items-center gap-2 relative group after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-cyan-500 hover:after:w-full after:transition-all after:duration-300">
          <User className="w-4 h-4 transition-colors duration-300 group-hover:text-emerald-400" />
          Profile
        </Link>
      </nav>
    </div>
  );
}

export default AsideNav;
