import Link from "next/link";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-pink-500 text-2xl text-white shadow-lg shadow-rose-500/30">
            ❤
          </span>
          <h1 className="text-foreground font-serif text-2xl sm:text-3xl">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to manage the site.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <LoginForm />
        </div>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          First time?{" "}
          <Link href="/register" className="text-rose-300 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
