"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Input, Label, SubmitButton } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useAuth } from "@/context/auth-provider";
import { post } from "@/lib/api";
import { friendlyError } from "@/lib/errors";

export function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(undefined);
    setRetryable(false);
    try {
      const body = await post<{ data: { name: string } }>("/auth/login", {
        email,
        password,
      });
      showToast("success", `Welcome back, ${body.data.name}`);
      await refresh();
      router.push("/");
      router.refresh();
    } catch (err) {
      const friendly = friendlyError(err);
      setError(friendly.message);
      setRetryable(friendly.retryable);
      showToast("error", friendly.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {error && (
        <div
          role="alert"
          className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      <SubmitButton loading={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </SubmitButton>

      {retryable && (
        <button
          type="submit"
          disabled={loading}
          className="text-muted-foreground hover:text-foreground w-full text-center text-sm underline-offset-4 hover:underline"
        >
          Try again
        </button>
      )}
    </form>
  );
}
