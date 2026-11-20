import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ACCENTS = new Set(["lime", "coral", "violet"]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    code?: string;
    description?: string;
    accent?: string;
    memberIds?: string[];
  } | null;

  const name = body?.name?.trim() ?? "";
  const code = (body?.code?.trim().toUpperCase() || "PRJ").slice(0, 6);
  const description = body?.description?.trim() ?? "";
  const accent = ALLOWED_ACCENTS.has(body?.accent ?? "")
    ? (body!.accent as "lime" | "coral" | "violet")
    : "lime";
  const memberIds = Array.isArray(body?.memberIds)
    ? Array.from(
        new Set(
          body.memberIds.filter(
            (mid): mid is string => typeof mid === "string" && mid.length > 0,
          ),
        ),
      )
    : [];

  if (!name) {
    return NextResponse.json(
      { error: "Project name is required." },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.project.update({
      where: { id },
      data: { name, code, description, accent },
    }),
    prisma.projectMember.deleteMany({
      where: { projectId: id },
    }),
    ...(memberIds.length > 0
      ? [
          prisma.projectMember.createMany({
            data: memberIds.map((userId) => ({
              projectId: id,
              userId,
            })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);

  return NextResponse.json({
    project: {
      id,
      name,
      code,
      description,
      accent,
      memberIds,
    },
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

  await prisma.project.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
