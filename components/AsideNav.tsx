import Link from "next/link";

function AsideNav() {
  return (
    <div className="bg-[#1A1F26] flex flex-col w-fit min-h-full p-8 text-white">
      <nav className="flex flex-col gap-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/tasks" className="hover:underline">
          Tasks
        </Link>
        <Link href="/compare" className="hover:underline">
          Compare
        </Link>
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
      </nav>
    </div>
  );
}

export default AsideNav;
