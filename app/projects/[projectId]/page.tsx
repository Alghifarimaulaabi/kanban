import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ProjectAccent } from "@/components/admin/types";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { KanbanMember, KanbanTask } from "@/components/kanban/types";
import { prisma } from "@/lib/prisma";
import { canAccessProject, formatDateInput } from "@/lib/project-access";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Kanban Board — TECH BRO",
  description: "Manage project tasks, progress, and QC bug notes.",
};

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function ProjectBoardContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [session, { projectId }] = await Promise.all([
    requireUserSession(),
    params,
  ]);

  const allowed = await canAccessProject(
    projectId,
    session.user.id,
    session.user.role,
  );
  if (!allowed) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  const members: KanbanMember[] = project.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.user.role === "admin" ? "admin" : "member",
  }));

  const initialTasks: KanbanTask[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    startDate: formatDateInput(task.startDate),
    dueDate: formatDateInput(task.dueDate),
    assigneeId: task.assigneeId,
    assignee: task.assignee,
    comments: task.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      roleTag: comment.roleTag === "PIC" ? "PIC" : "QC",
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
    })),
  }));

  return (
    <KanbanBoard
      project={{
        id: project.id,
        code: project.code,
        name: project.name,
        description: project.description ?? "",
        accent: normalizeAccent(project.accent),
      }}
      members={members}
      initialTasks={initialTasks}
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role === "admin" ? "admin" : "member",
      }}
    />
  );
}

export default function ProjectKanbanPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading Kanban board...
          </div>
        </div>
      }
    >
      <ProjectBoardContent params={params} />
    </Suspense>
  );
}
