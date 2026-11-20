import { Suspense, type ReactNode } from "react";
import type { ProjectAccent } from "@/components/admin/types";
import type { SidebarProject } from "@/components/layout/app-sidebar";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/session";

function normalizeAccent(value: string): ProjectAccent {
  if (value === "coral" || value === "violet") return value;
  return "lime";
}

async function AuthenticatedWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
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
    select: {
      id: true,
      code: true,
      name: true,
      accent: true,
    },
  });

  const projects: SidebarProject[] = dbProjects.map((project) => ({
    id: project.id,
    code: project.code,
    name: project.name,
    accent: normalizeAccent(project.accent),
  }));

  return (
    <WorkspaceShell
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: isAdmin ? "admin" : "member",
      }}
      projects={projects}
    >
      {children}
    </WorkspaceShell>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh items-center justify-center p-6">
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-4 text-[15px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-md)]">
            Loading workspace...
          </div>
        </div>
      }
    >
      <AuthenticatedWorkspaceLayout>{children}</AuthenticatedWorkspaceLayout>
    </Suspense>
  );
}
