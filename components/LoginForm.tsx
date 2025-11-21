"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function LoginForm() {
  const handleLogin = () => {
    // Redirect to Auth0 login
    window.location.href = "/api/auth/login";
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-600 text-center">
          Sign in with your @obsidianagency.com account
        </p>
        <Button onClick={handleLogin} variant="outline" className="w-full">
          Login with Auth0
        </Button>
        <Link href="/register" className="text-sm text-gray-500">
          Don&apos;t have an account? Register
        </Link>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
