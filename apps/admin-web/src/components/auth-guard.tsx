"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="border-foreground/20 border-t-rose-400 h-8 w-8 animate-spin rounded-full border-2" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
