import { Suspense } from "react";
import type { Metadata } from "next";
import type { ProjectAccent } from "@/components/admin/types";
import {
  MyTasksView,
  type CreatedTaskItem,
} from "@/components/tasks/my-tasks-view";
import { prisma } from "@/lib/prisma";
import { formatDateInput } from "@/lib/project-access";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Tasks — TECH BRO",
  description: "View and delete tasks you created across workspace projects.",
};

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function MyTasksContent() {
  const session = await requireUserSession();

  const dbTasks = await prisma.task.findMany({
    where: {
      OR: [
        { createdById: session.user.id },
        {
          createdById: null,
          activities: {
            some: {
              action: "TASK_CREATED",
              actorId: session.user.id,
            },
          },
        },
      ],
    },
    include: {
      project: {
        select: { id: true, code: true, name: true, accent: true },
      },
      assignee: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const initialTasks: CreatedTaskItem[] = dbTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    dueDate: formatDateInput(task.dueDate),
    createdAt: task.createdAt.toISOString(),
    projectId: task.project.id,
    projectCode: task.project.code,
    projectName: task.project.name,
    projectAccent: normalizeAccent(task.project.accent),
    assignee: task.assignee,
  }));

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
