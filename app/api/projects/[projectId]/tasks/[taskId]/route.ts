import { NextRequest, NextResponse } from "next/server";
import type { TaskPriority, TaskStatus } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; taskId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, taskId } = await context.params;
  const allowed = await canAccessProject(
    projectId,
    session.user.id,
    session.user.role,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
    progress?: number;
  } | null;

  const data: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    startDate?: Date | null;
    dueDate?: Date | null;
    progress?: number;
  } = {};

  if (typeof body?.title === "string") {
    const trimmed = body.title.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Task name cannot be empty." },
        { status: 400 },
      );
    }
    data.title = trimmed;
  }

  if (typeof body?.description === "string") {
    data.description = body.description.trim() || null;
  }

  if (body?.status && VALID_STATUSES.has(body.status)) {
    data.status = body.status;
  }

  if (body?.priority && VALID_PRIORITIES.has(body.priority)) {
    data.priority = body.priority;
  }

  if (body && "assigneeId" in body) {
    data.assigneeId =
      typeof body.assigneeId === "string" && body.assigneeId.trim()
        ? body.assigneeId.trim()
        : null;
  }

  if (body && "startDate" in body) {
    data.startDate = parseOptionalDate(body.startDate);
  }

  if (body && "dueDate" in body) {
    data.dueDate = parseOptionalDate(body.dueDate);
  }

  if (typeof body?.progress === "number" && Number.isFinite(body.progress)) {
    data.progress = Math.max(0, Math.min(100, Math.round(body.progress)));
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({
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
    },
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; taskId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, taskId } = await context.params;
  const allowed = await canAccessProject(
    projectId,
    session.user.id,
    session.user.role,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ ok: true });
}
