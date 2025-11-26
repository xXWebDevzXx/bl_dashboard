import RegisterForm from "@/components/RegisterForm";

export default function register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Black Lemon Dashboard</h1>
        <RegisterForm />
      </main>
    </div>
  );
}
