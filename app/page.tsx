import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

async function RootRedirect(): Promise<null> {
  const session = await getServerSession();

  if (session?.user.role === "admin") {
    redirect("/admin");
  }

  redirect("/login");
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading TECH BRO...
          </div>
        </div>
      }
    >
      <RootRedirect />
    </Suspense>
  );
}
