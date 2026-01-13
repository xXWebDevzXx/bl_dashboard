import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { VerifyEmailButton } from "./VerifyEmailButton";
import { VerifyEmailToast } from "./VerifyEmailToast";

// Force dynamic rendering for auth operations
export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth0.getSession();

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  // If email is already verified, redirect to dashboard
  if (session.user.email_verified) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-card-foreground font-sans">
      <VerifyEmailToast status={params.status} />
      <main className="flex flex-col items-center justify-center gap-4">
        <Card className="w-full max-w-md bg-card border-border-zinc/60 shadow-2xl shadow-black/40">
          <CardHeader className="space-y-2 text-center border-b border-border-zinc/60 pb-6">
            <CardTitle className="text-2xl text-white">Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-zinc-400">
                We&apos;ve sent a verification email to:
              </p>
              <p className="font-semibold text-lg text-white">{session.user.email}</p>

              <div className="bg-emerald-normal/10 border border-emerald-normal/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-emerald-light">
                  Please check your inbox and click the verification link to
                  continue.
                </p>
              </div>

              <div className="text-sm text-zinc-500 space-y-2 mt-6">
                <p className="text-zinc-400">Can&apos;t find the email?</p>
                <ul className="list-disc list-inside text-left">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure the email address is correct</li>
                  <li>Wait a few minutes and refresh this page</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border-zinc space-y-3">
                <p className="text-sm text-zinc-400">
                  After verifying your email, click the button below:
                </p>
                <VerifyEmailButton />
                <p className="text-xs text-zinc-500">
                  This will refresh your session and redirect you to the
                  dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
