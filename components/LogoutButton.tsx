"use client";

import { useState } from "react";
import { logout } from "@/lib/logout";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Note: redirect happens in logout(), so this won't execute
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors"
    >
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </button>
  );
}

