"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const handleRegister = async () => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Register successful:");
        router.push("/login");
      } else {
        setError(data.error || "Register failed");
      }
    } catch (err) {
      console.error("Error during register:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center">
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleRegister} variant="outline">
          Register
        </Button>
        <Link href="/login" className="text-sm text-gray-500">
          Already have an account? Login
        </Link>
      </CardContent>
    </Card>
  );
}

export default RegisterForm;
