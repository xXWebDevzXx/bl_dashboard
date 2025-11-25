import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const session = await auth0.getSession();

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  // If email is already verified, redirect to dashboard
  if (session.user.email_verified) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center justify-center">
            <CardTitle>Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                We&apos;ve sent a verification email to:
              </p>
              <p className="font-semibold text-lg">{session.user.email}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  Please check your inbox and click the verification link to
                  continue.
                </p>
              </div>

              <div className="text-sm text-gray-500 space-y-2 mt-6">
                <p>Can&apos;t find the email?</p>
                <ul className="list-disc list-inside text-left">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure the email address is correct</li>
                  <li>Wait a few minutes and refresh this page</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t space-y-3">
                <p className="text-sm text-gray-600">
                  After verifying your email, click the button below:
                </p>
                <a
                  href="/api/auth/refresh-session"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center"
                >
                  I&apos;ve verified my email - Continue →
                </a>
                <p className="text-xs text-gray-500">
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
