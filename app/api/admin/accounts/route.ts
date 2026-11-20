import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/project-access";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "member";
    projectIds?: string[];
  } | null;

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const role = body?.role === "admin" ? "admin" : "member";
  const projectIds = Array.isArray(body?.projectIds)
    ? body.projectIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      { error: "Name, valid email, and password (min 8 chars) are required." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  try {
    const created = await auth.api.createUser({
      headers: request.headers,
      body: {
        name,
        email,
        password,
        role: role === "admin" ? "admin" : "user",
      },
    });

    const userId = created.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    if (projectIds.length > 0) {
      await prisma.projectMember.createMany({
        data: projectIds.map((projectId) => ({
          projectId,
          userId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      {
        account: {
          id: userId,
          name: created.user.name,
          email: created.user.email,
          role,
          createdAt: formatShortDate(new Date(created.user.createdAt)),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
