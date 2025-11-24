"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function RegisterForm() {
  const handleRegister = () => {
    // Redirect to Auth0 signup (same as login for Auth0 Universal Login)
    window.location.href = "/api/auth/login?screen_hint=signup";
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-600 text-center">
          Create an account with your @obsidianagency.com email
        </p>
        <Button onClick={handleRegister} variant="outline" className="w-full">
          Sign Up with Auth0
        </Button>
        <Link href="/login" className="text-sm text-gray-500">
          Already have an account? Login
        </Link>
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
