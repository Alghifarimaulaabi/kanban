import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Console — TECH BRO",
  description:
    "Create client dashboard project cards and provision team member accounts for TECH BRO.",
};

async function ProtectedAdminWorkspace() {
  const session = await requireAdminSession();

  return (
    <AdminDashboard
      currentAdmin={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Verifying admin session...
          </div>
        </div>
      }
    >
      <ProtectedAdminWorkspace />
    </Suspense>
  );
}
