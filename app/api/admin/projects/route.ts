import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/project-access";

const ALLOWED_ACCENTS = new Set(["lime", "coral", "violet"]);

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
            (id): id is string => typeof id === "string" && id.length > 0,
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

  const project = await prisma.project.create({
    data: {
      name,
      code,
      description,
      accent,
      createdById: session.user.id,
      members: {
        create: memberIds.map((userId) => ({ userId })),
      },
    },
    include: {
      members: { select: { userId: true } },
    },
  });

  return NextResponse.json(
    {
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        description: project.description ?? "",
        accent,
        memberIds: project.members.map((m) => m.userId),
        stages: {
          backlog: 0,
          todo: 0,
          revision: 0,
          inProgress: 0,
          inReview: 0,
          done: 0,
        },
        createdAt: formatShortDate(project.createdAt),
      },
    },
    { status: 201 },
  );
}
