import { Suspense } from "react";
import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Settings — TECH BRO",
  description: "Update your display name and account password.",
};

async function SettingsContent() {
  const session = await requireUserSession();

  return (
    <SettingsView
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role === "admin" ? "admin" : "member",
      }}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading settings...
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
