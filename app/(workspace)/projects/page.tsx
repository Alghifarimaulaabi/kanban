import { Suspense } from "react";
import type { Metadata } from "next";
import type { ProjectAccent } from "@/components/admin/types";
import type { DashboardProjectCard } from "@/components/dashboard/team-dashboard";
import { ProjectsDirectory } from "@/components/projects/projects-directory";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Projects — TECH BRO",
  description: "Browse all assigned projects and open Kanban or Calendar views.",
};

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function ProjectsContent() {
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

  return <ProjectsDirectory projects={projects} isAdmin={isAdmin} />;
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading projects...
          </div>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
