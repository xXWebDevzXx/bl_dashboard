"use client";

import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  return (
    <Button
      asChild
      className="bg-gradient-to-r from-emerald-normal to-cyan-normal hover:from-emerald-normal hover:to-cyan-normal text-white border-0 shadow-lg shadow-emerald-normal/20 hover:shadow-emerald-normal/30 transition-all duration-300"
    >
      <a href="/api/auth/login">
        <LogIn className="w-4 h-4 mr-2" />
        Log In
      </a>
    </Button>
  );
}
