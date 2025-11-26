"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { logout } from "@/lib/logout";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuthUser();

  if (!user) {
    return null;
  }

  const isUserLoggedIn = user.name;

  if (!isUserLoggedIn) {
    return null;
  }

  // Extract username from email (part before @)
  const displayName = isUserLoggedIn.includes("@")
    ? isUserLoggedIn.split("@")[0]
    : isUserLoggedIn;

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
      {isLoggingOut ? "Logging out..." : `Log Out ${displayName}`}
    </button>
  );
}
