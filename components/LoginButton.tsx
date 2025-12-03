"use client";

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  return (
    <Button
      asChild
      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300"
    >
      <a href="/api/auth/login">
        <LogIn className="w-4 h-4 mr-2" />
        Log In
      </a>
    </Button>
  );
}
