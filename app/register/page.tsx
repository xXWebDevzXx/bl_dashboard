import RegisterForm from "@/components/RegisterForm";

export default function register() {
  return (
    <div className="min-h-screen bg-card-foreground p-8">
      <div className="flex min-h-screen items-center justify-center">
        <main className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-5xl font-bold bg-linear-to-r from-emerald-light to-cyan-light p-2 bg-clip-text text-transparent">Delegate</h1>
          <RegisterForm />
        </main>
      </div>
    </div>
  );
}
