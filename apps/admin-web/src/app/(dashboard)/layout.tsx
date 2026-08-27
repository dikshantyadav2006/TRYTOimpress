import { AuthGuard } from "@/components/auth-guard";
import { AdminShell } from "@/components/admin-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
