"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const handleLogin = async () => {
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:");
        router.push('/');
       
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleLogin} variant="outline">
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
