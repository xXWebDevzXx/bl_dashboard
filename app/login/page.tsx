import LoginForm from "@/components/LoginForm";
import { AccountDeletedHandler } from "@/components/AccountDeletedHandler";
import { Suspense } from "react";

function login() {
  return (
    <div className="min-h-screen bg-card-foreground p-8">
      <Suspense fallback={null}>
        <AccountDeletedHandler />
      </Suspense>

      <div className="flex min-h-screen items-center justify-center">
        <main className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-5xl font-bold bg-linear-to-r from-emerald-light to-cyan-light bg-clip-text text-transparent">
            AITracker
          </h1>
          <LoginForm />
        </main>
      </div>
    </div>
  );
}

export default login;