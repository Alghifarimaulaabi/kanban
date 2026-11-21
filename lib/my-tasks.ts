import { revalidatePath } from "next/cache";
import type { ProjectAccent } from "@/components/admin/types";
import type { CreatedTaskItem } from "@/components/tasks/my-tasks-view";
import { prisma } from "@/lib/prisma";
import { formatDateInput } from "@/lib/project-access";

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

export function buildMyCreatedTasksWhere(userId: string) {
  return {
    OR: [
      { createdById: userId },
      {
        createdById: null,
        activities: {
          some: {
            action: "TASK_CREATED",
            actorId: userId,
          },
        },
      },
    ],
  };
}

export async function getMyCreatedTasksCount(userId: string): Promise<number> {
  return prisma.task.count({
    where: buildMyCreatedTasksWhere(userId),
  });
}

export async function getMyCreatedTasks(
  userId: string,
): Promise<CreatedTaskItem[]> {
  const dbTasks = await prisma.task.findMany({
    where: buildMyCreatedTasksWhere(userId),
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

  return dbTasks.map((task) => ({
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
}

export function revalidateTaskViews(projectId?: string) {
  revalidatePath("/my-tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/(workspace)", "layout");
}
