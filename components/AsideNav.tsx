import Link from "next/link";
import { LayoutDashboard, ListTodo, GitCompare, User } from "lucide-react";

function AsideNav() {
  return (
    <div className="bg-[#1A1F26] flex flex-col w-fit min-h-full p-8 text-white">
      <nav className="flex flex-col gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:underline">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link href="/tasks" className="flex items-center gap-2 hover:underline">
          <ListTodo className="w-4 h-4" />
          Tasks
        </Link>
        <Link href="/compare" className="flex items-center gap-2 hover:underline">
          <GitCompare className="w-4 h-4" />
          Compare
        </Link>
        <Link href="/profile" className="flex items-center gap-2 hover:underline">
          <User className="w-4 h-4" />
          Profile
        </Link>
      </nav>
    </div>
  );
}

export default AsideNav;
