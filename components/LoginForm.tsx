"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

function LoginForm() {
  const handleClick = () => {
    console.log("Button clicked");
  };
  return (
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
  );
}

export default LoginForm;
