
"use client";

import LogoutButton from "./LogoutButton";

function Header() {
    return (
      <header className="bg-[#1A1F26] flex justify-between items-center text-white p-8 col-span-2">
        <h1 className="text-4xl font-bold">AITracker</h1>
        <LogoutButton />
      </header>
    );
}

export default Header;