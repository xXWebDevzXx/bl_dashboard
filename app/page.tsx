"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
export default function Home() {
  const handleClick = () => {
    console.log("Button clicked");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Black Lemon Dashboard</h1>
        <Card>
          <CardHeader className="flex flex-col items-center justify-center">
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button onClick={handleClick} variant="outline">
              Login
            </Button>
            <Link href="/register" className="text-sm text-gray-500">
              Don&apos;t have an account? Register
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
