"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { logout } from "@/lib/logout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Note: redirect happens in logout(), so this won't execute
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant="outline"
      className="border-border-zinc bg-zinc-900/50 text-zinc-300 hover:bg-gradient-to-r hover:from-emerald-normal/5 hover:to-cyan-normal/5 hover:text-white hover:border-emerald-normal/10 cursor-pointer transition-all ease-in-out"
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </Button>
  );
}
