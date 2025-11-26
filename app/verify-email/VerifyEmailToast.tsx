"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function VerifyEmailToast({ status }: { status?: string }) {
  useEffect(() => {
    if (status === "not-verified") {
      // Use a small timeout to ensure Toaster is mounted
      const timer = setTimeout(() => {
        toast.error("Please verify your email first by clicking the link in your inbox.", {
          duration: 5000,
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  return null;
}

