import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/project-access";

export async function POST(
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

  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    select: { id: true },
  });
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    content?: string;
    roleTag?: string;
  } | null;

  const content = body?.content?.trim() ?? "";
  if (!content) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 },
    );
  }

  const roleTag = body?.roleTag === "PIC" ? "PIC" : "QC";
  const excerpt = content.length > 80 ? `${content.slice(0, 80)}...` : content;

  const [comment, activity] = await prisma.$transaction([
    prisma.taskComment.create({
      data: {
        taskId,
        authorId: session.user.id,
        content,
        roleTag,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.taskActivity.create({
      data: {
        taskId,
        actorId: session.user.id,
        action: "COMMENT_ADDED",
        summary: `Menambahkan Catatan ${roleTag}: "${excerpt}"`,
      },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        content: comment.content,
        roleTag: comment.roleTag === "PIC" ? "PIC" : "QC",
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
      },
      activity: {
        id: activity.id,
        action: activity.action,
        summary: activity.summary,
        createdAt: activity.createdAt.toISOString(),
        actor: activity.actor,
      },
    },
    { status: 201 },
  );
}
