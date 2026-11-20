import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    role?: "admin" | "member";
  } | null;

  const nextRole = body?.role === "admin" ? "admin" : "user";

  const updated = await prisma.user.update({
    where: { id },
    data: { role: nextRole },
    select: { id: true, role: true },
  });

  return NextResponse.json({
    id: updated.id,
    role: updated.role === "admin" ? "admin" : "member",
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot remove your own account." },
      { status: 400 },
    );
  }

  const createdProjectsCount = await prisma.project.count({
    where: { createdById: id },
  });

  if (createdProjectsCount > 0) {
    await prisma.project.updateMany({
      where: { createdById: id },
      data: { createdById: session.user.id },
    });
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
