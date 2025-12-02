import LoginForm from "@/components/LoginForm";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

// Force dynamic rendering for auth operations
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth0.getSession();

  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Black Lemon Dashboard :D</h1>
        <LoginForm />
      </main>
    </div>
  );
}
