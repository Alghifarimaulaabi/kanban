import { Suspense } from "react";
import type { Metadata } from "next";
import {
  TeamDashboard,
  type DashboardProjectCard,
} from "@/components/dashboard/team-dashboard";
import type { ProjectAccent } from "@/components/admin/types";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Project Dashboard — TECH BRO",
  description: "Select a project card to open its Kanban board.",
};

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function ProtectedDashboardContent() {
  const session = await requireUserSession();
  const isAdmin = session.user.role === "admin";

  const dbProjects = await prisma.project.findMany({
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
  });

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

  return (
    <TeamDashboard
      currentUser={{
        name: session.user.name,
        email: session.user.email,
        role: isAdmin ? "admin" : "member",
      }}
      projects={projects}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading projects...
          </div>
        </div>
      }
    >
      <ProtectedDashboardContent />
    </Suspense>
  );
}
