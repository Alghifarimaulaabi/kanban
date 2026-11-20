import { prisma } from "@/lib/prisma";

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateInput(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function parseOptionalDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(`${value.trim()}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function canAccessProject(
  projectId: string,
  userId: string,
  role?: string | null,
): Promise<boolean> {
  if (role === "admin") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    return Boolean(project);
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: { id: true },
  });

  return Boolean(membership);
}
