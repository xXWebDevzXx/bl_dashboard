import RegisterForm from "@/components/RegisterForm";

export default function register() {
  return (
    <div className="min-h-screen bg-[#0D1117] p-8">
      <div className="flex min-h-screen items-center justify-center">
        <main className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-5xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            AITracker
          </h1>
          <RegisterForm />
        </main>
      </div>
    </div>
  );
}
