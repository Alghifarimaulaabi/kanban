import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidateTaskViews } from "@/lib/my-tasks";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await context.params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      createdById: true,
      activities: {
        where: {
          action: "TASK_CREATED",
          actorId: session.user.id,
        },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const isCreator =
    task.createdById === session.user.id ||
    (task.createdById === null && task.activities.length > 0);

  if (!isCreator) {
    return NextResponse.json(
      { error: "Kamu hanya bisa menghapus task yang kamu buat sendiri." },
      { status: 403 },
    );
  }

  await prisma.task.delete({ where: { id: task.id } });
  revalidateTaskViews(task.projectId);

  return NextResponse.json({ ok: true, id: task.id });
}
