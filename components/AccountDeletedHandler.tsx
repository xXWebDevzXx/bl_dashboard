"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AccountDeletedHandler() {
  const searchParams = useSearchParams();
  const accountDeleted = searchParams.get("accountDeleted");

  useEffect(() => {
    if (accountDeleted === "true") {
      toast.error("Account Deleted", {
        description: "This account has been permanently deleted.",
        duration: 3000,
      });

      // Log out after showing toast
      setTimeout(() => {
        window.location.href = "/api/auth/logout";
      }, 2000);
    }
  }, [accountDeleted]);

  return null;
}


