import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type {
  AdminAccount,
  AdminProject,
  ProjectAccent,
} from "@/components/admin/types";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/project-access";
import { requireAdminSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Console — TECH BRO",
  description:
    "Create client dashboard project cards and provision team member accounts for TECH BRO.",
};

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function ProtectedAdminWorkspace() {
  const session = await requireAdminSession();

  const [dbUsers, dbProjects] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: { select: { userId: true } },
        tasks: { select: { status: true } },
      },
    }),
  ]);

  const initialAccounts: AdminAccount[] = dbUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "member",
    createdAt: formatShortDate(user.createdAt),
    isCurrentAdmin: user.id === session.user.id,
  }));

  const initialProjects: AdminProject[] = dbProjects.map((project) => {
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
      memberIds: project.members.map((m) => m.userId),
      stages,
      createdAt: formatShortDate(project.createdAt),
    };
  });

  return (
    <AdminDashboard
      currentAdmin={{
        name: session.user.name,
        email: session.user.email,
      }}
      initialAccounts={initialAccounts}
      initialProjects={initialProjects}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Verifying admin session...
          </div>
        </div>
      }
    >
      <ProtectedAdminWorkspace />
    </Suspense>
  );
}
