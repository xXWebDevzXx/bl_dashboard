"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { UserPlus, ArrowRight } from "lucide-react";

function RegisterForm() {
  const handleRegister = () => {
    // Redirect to Auth0 signup (same as login for Auth0 Universal Login)
    window.location.href = "/api/auth/login?screen_hint=signup";
  };

  return (
    <Card className="w-full min-w-0 sm:min-w-md max-w-md mx-auto px-4 sm:px-0 bg-[#161B22] border-zinc-800/60 shadow-2xl shadow-black/40 animate-[fadeInScale_0.6s_ease-out_0.1s_both]">
      <CardHeader className="space-y-2 text-center border-b border-zinc-800/60 pb-6">
        <CardTitle className="text-2xl text-white">Create Account</CardTitle>
        <CardDescription className="text-zinc-400">Create an account with your @obsidianagency.com email</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Button onClick={handleRegister} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300" size="lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up with Auth0
        </Button>

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#161B22] text-zinc-500">Already registered?</span>
          </div>
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors group">
          Sign in to your account
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
