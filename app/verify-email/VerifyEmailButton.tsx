"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function VerifyEmailButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyEmail = () => {
    setIsLoading(true);
    toast.info("Checking verification status...");
    // Redirect to refresh-session which will refresh the Auth0 session
    // and redirect to dashboard if email is verified
    window.location.href = "/api/auth/refresh-session";
  };

  return (
    <Button onClick={handleVerifyEmail} disabled={isLoading}>
      {isLoading ? "Checking..." : "I've verified my email - Continue →"}
    </Button>
  );
}
