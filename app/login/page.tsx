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
        <main className="flex flex-col items-center align-baseline justify-center gap-8">
          <div className="flex items-center">
            
            <svg width="64" height="64" viewBox="0 0 139 133" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-gradient-2" x1="0" y1="0" x2="139" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" style={{ stopColor: "var(--emerald-light)", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "var(--cyan-light)", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <g fill="url(#logo-gradient-2)">
                <path d="M130.653 2.15015L108.153 23.1502C115.514 119.402 75.5144 108.148 6.15298 112.65L6.15298 130.65L41.657 130.851C109.334 130.851 146.978 97.4487 130.653 2.15015Z" />
                <path d="M130.653 2.15015L109.153 23.65C12.6563 21.0346 27.2359 61.1518 26.153 130.65L6.15295 130.65L5.88781 97.0106C2.55701 29.4165 34.6669 -9.46459 130.653 2.15015Z" />
              </g>
            </svg>
            <h1 className="text-5xl font-bold bg-linear-to-r from-emerald-light to-cyan-light p-2 bg-clip-text text-transparent">Delegate</h1>
          </div>
          <LoginForm />
        </main>
      </div>
    </div>
  );
}

export default login;