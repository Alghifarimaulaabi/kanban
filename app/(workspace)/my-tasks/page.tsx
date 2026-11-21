import { Suspense } from "react";
import type { Metadata } from "next";
import { MyTasksView } from "@/components/tasks/my-tasks-view";
import { getMyCreatedTasks } from "@/lib/my-tasks";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Tasks — TECH BRO",
  description: "View and delete tasks you created across workspace projects.",
};

async function MyTasksContent() {
  const session = await requireUserSession();
  const initialTasks = await getMyCreatedTasks(session.user.id);

  return <MyTasksView initialTasks={initialTasks} />;
}

export default function MyTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading my tasks...
          </div>
        </div>
      }
    >
      <MyTasksContent />
    </Suspense>
  );
}
