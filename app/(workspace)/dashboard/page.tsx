import { Suspense } from "react";
import type { Metadata } from "next";
import {
  TeamDashboard,
  type DashboardMyTask,
  type DashboardProjectCard,
} from "@/components/dashboard/team-dashboard";
import type { ProjectAccent } from "@/components/admin/types";
import { prisma } from "@/lib/prisma";
import { formatDateInput } from "@/lib/project-access";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — TECH BRO",
  description: "Workspace overview, active tasks, and recent projects.",
};

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function ProtectedDashboardContent() {
  const session = await requireUserSession();
  const isAdmin = session.user.role === "admin";

  const [dbProjects, dbMyTasks] = await Promise.all([
    prisma.project.findMany({
      where: isAdmin
        ? undefined
        : {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        tasks: {
          select: { status: true },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        status: { not: "DONE" },
        ...(isAdmin
          ? {}
          : {
              project: {
                members: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            }),
      },
      include: {
        project: {
          select: { id: true, code: true, name: true, accent: true },
        },
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    }),
  ]);

  const projects: DashboardProjectCard[] = dbProjects.map((project) => {
    const stages = {
      backlog: 0,
      todo: 0,
      revision: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
    };

    for (const task of project.tasks) {
      if (task.status === "BACKLOG") stages.backlog += 1;
      else if (task.status === "TODO") stages.todo += 1;
      else if (task.status === "REVISION") stages.revision += 1;
      else if (task.status === "IN_PROGRESS") stages.inProgress += 1;
      else if (task.status === "IN_REVIEW") stages.inReview += 1;
      else if (task.status === "DONE") stages.done += 1;
    }

    return {
      id: project.id,
      code: project.code,
      name: project.name,
      description: project.description ?? "",
      accent: normalizeAccent(project.accent),
      members: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        role: m.user.role === "admin" ? "admin" : "member",
      })),
      stages,
    };
  });

  const myTasks: DashboardMyTask[] = dbMyTasks
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      dueDate: formatDateInput(task.dueDate),
      projectId: task.project.id,
      projectCode: task.project.code,
      projectName: task.project.name,
      projectAccent: normalizeAccent(task.project.accent),
    }))
    .sort((a, b) => {
      if (a.status === "REVISION" && b.status !== "REVISION") return -1;
      if (b.status === "REVISION" && a.status !== "REVISION") return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

  return (
    <TeamDashboard
      currentUser={{
        name: session.user.name,
        email: session.user.email,
        role: isAdmin ? "admin" : "member",
      }}
      projects={projects}
      myTasks={myTasks}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading dashboard...
          </div>
        </div>
      }
    >
      <ProtectedDashboardContent />
    </Suspense>
  );
}
