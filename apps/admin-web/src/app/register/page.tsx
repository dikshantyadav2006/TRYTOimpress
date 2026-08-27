import Link from "next/link";

import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-pink-500 text-2xl text-white shadow-lg shadow-rose-500/30">
            ❤
          </span>
          <h1 className="text-foreground font-serif text-2xl sm:text-3xl">Create your site</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Anyone can join. The first account becomes the admin; everyone else gets their own
            page to build and share.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <RegisterForm />
        </div>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-rose-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
