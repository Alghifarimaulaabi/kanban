import { NextRequest, NextResponse } from "next/server";
import type { TaskPriority, TaskStatus } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import { revalidateTaskViews } from "@/lib/my-tasks";
import { prisma } from "@/lib/prisma";
import {
  canAccessProject,
  formatDateInput,
  parseOptionalDate,
} from "@/lib/project-access";

const VALID_STATUSES = new Set<TaskStatus>([
  "BACKLOG",
  "TODO",
  "REVISION",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
]);

const VALID_PRIORITIES = new Set<TaskPriority>([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  REVISION: "Revision",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const allowed = await canAccessProject(
    projectId,
    session.user.id,
    session.user.role,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    startDate?: string;
    dueDate?: string;
    progress?: number;
    initialNotes?: { content?: string; roleTag?: string }[];
  } | null;

  const title = body?.title?.trim() ?? "";
  if (!title) {
    return NextResponse.json(
      { error: "Task name is required." },
      { status: 400 },
    );
  }

  const status: TaskStatus =
    body?.status && VALID_STATUSES.has(body.status) ? body.status : "BACKLOG";
  const priority: TaskPriority =
    body?.priority && VALID_PRIORITIES.has(body.priority)
      ? body.priority
      : "MEDIUM";
  const rawProgress = Number(body?.progress ?? 0);
  const progress = Number.isFinite(rawProgress)
    ? Math.max(0, Math.min(100, Math.round(rawProgress)))
    : 0;

  const assigneeId =
    typeof body?.assigneeId === "string" && body.assigneeId.trim()
      ? body.assigneeId.trim()
      : null;

  const initialNotes = Array.isArray(body?.initialNotes)
    ? body.initialNotes
        .map((n) => ({
          content: typeof n?.content === "string" ? n.content.trim() : "",
          roleTag: n?.roleTag === "PIC" ? "PIC" : "QC",
        }))
        .filter((n) => n.content.length > 0)
    : [];

  const initialActivities = [
    {
      action: "TASK_CREATED",
      summary: `Membuat task di kolom ${STATUS_LABELS[status]}`,
      actorId: session.user.id,
    },
    ...initialNotes.map((note) => ({
      action: "COMMENT_ADDED",
      summary: `Menambahkan Catatan ${note.roleTag}: "${note.content.length > 80 ? `${note.content.slice(0, 80)}...` : note.content}"`,
      actorId: session.user.id,
    })),
  ];

  const task = await prisma.task.create({
    data: {
      projectId,
      createdById: session.user.id,
      title,
      description: body?.description?.trim() || null,
      status,
      priority,
      progress,
      startDate: parseOptionalDate(body?.startDate),
      dueDate: parseOptionalDate(body?.dueDate),
      assigneeId,
      comments:
        initialNotes.length > 0
          ? {
              create: initialNotes.map((note) => ({
                content: note.content,
                roleTag: note.roleTag,
                authorId: session.user.id,
              })),
            }
          : undefined,
      activities: {
        create: initialActivities,
      },
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  revalidateTaskViews(projectId);

  return NextResponse.json(
    {
      task: {
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
        comments: task.comments.map((c) => ({
          id: c.id,
          content: c.content,
          roleTag: c.roleTag === "PIC" ? "PIC" : "QC",
          createdAt: c.createdAt.toISOString(),
          author: c.author,
        })),
        activities: task.activities.map((a) => ({
          id: a.id,
          action: a.action,
          summary: a.summary,
          createdAt: a.createdAt.toISOString(),
          actor: a.actor,
        })),
      },
    },
    { status: 201 },
  );
}
