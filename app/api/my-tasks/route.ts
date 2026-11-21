import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyCreatedTasks } from "@/lib/my-tasks";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await getMyCreatedTasks(session.user.id);

  return NextResponse.json(
    { tasks },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
