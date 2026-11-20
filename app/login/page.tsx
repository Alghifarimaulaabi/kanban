import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandPanel } from "@/components/login/brand-panel";
import { LoginForm } from "@/components/login/login-form";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign In — TECH BRO",
  description:
    "Build. Connect. Level Up. Sign in to your TECH BRO collaboration workspace.",
};

function LoginShell() {
  return (
    <div className="tb-brutal-surface tb-grid-bg min-h-dvh w-full overflow-x-clip">
      <a
        href="#login-card"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[2px] focus:border-2 focus:border-[var(--tb-ink)] focus:bg-[var(--tb-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--tb-ink)] focus:shadow-[var(--tb-shadow-sm)]"
      >
        Skip to login form
      </a>

      <main className="mx-auto grid min-h-dvh w-full max-w-[1600px] grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-[1.06fr_0.94fr] lg:grid-rows-1">
        <BrandPanel />
        <LoginForm />
      </main>
    </div>
  );
}

async function LoginGate() {
  const session = await getServerSession();

  if (session?.user.role === "admin") {
    redirect("/admin");
  }

  if (session) {
    redirect("/dashboard");
  }

  return <LoginShell />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginGate />
    </Suspense>
  );
}
