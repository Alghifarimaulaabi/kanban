"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "@/components/admin/admin-icons";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import { ArrowRightIcon, TechBroMark } from "@/components/login/icons";

export interface DashboardProjectCard {
  id: string;
  code: string;
  name: string;
  description: string;
  accent: ProjectAccent;
  members: { id: string; name: string; role: "admin" | "member" }[];
  stages: {
    backlog: number;
    todo: number;
    revision: number;
    inProgress: number;
    inReview: number;
    done: number;
  };
}

interface TeamDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: "admin" | "member";
  };
  projects: DashboardProjectCard[];
}

const ACCENT_BG: Record<ProjectAccent, string> = {
  lime: "bg-[var(--tb-primary)]",
  coral: "bg-[var(--tb-secondary)]",
  violet: "bg-[var(--tb-accent)]",
};

export function TeamDashboard({ currentUser, projects }: TeamDashboardProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="tb-brutal-surface tb-grid-bg min-h-dvh w-full overflow-x-clip">
      <header className="sticky top-0 z-30 border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex shadow-[var(--tb-shadow-xs)]">
              <TechBroMark className="h-9 w-9" />
            </span>
            <span className="text-[20px] font-bold tracking-[0.06em] text-[var(--tb-ink)]">
              TECH BRO
            </span>
            <span className="rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-accent)] px-2 py-0.5 text-[11px] font-bold tracking-[0.08em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]">
              WORKSPACE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === "admin" ? (
              <Link
                href="/admin"
                className="tb-tactile-motion inline-flex min-h-[44px] items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3.5 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:brightness-95"
              >
                Admin Console
              </Link>
            ) : null}

            <div className="hidden items-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 py-1.5 sm:flex">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[11px] font-bold text-[var(--tb-ink)]">
                {getInitials(currentUser.name)}
              </span>
              <span className="text-[13px] font-bold text-[var(--tb-ink)]">
                {currentUser.name}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="tb-tactile-motion inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3.5 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isSigningOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">
        <div className="border-b-[3px] border-[var(--tb-ink)] pb-6">
          <h1 className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[40px]">
            Project Dashboard
          </h1>
          <p className="mt-2 max-w-[56ch] text-[15px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
            Pilih project card di bawah untuk membuka Kanban board dan mengelola task tim.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="mt-8 rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-10 text-center shadow-[var(--tb-shadow-md)]">
            <h2 className="text-[22px] font-bold text-[var(--tb-ink)]">
              Belum ada project yang tersedia
            </h2>
            <p className="mx-auto mt-2 max-w-[46ch] text-[14px] font-medium text-[var(--tb-ink-muted)]">
              Kamu belum di-assign ke project mana pun. Hubungi admin workspace agar akunmu ditambahkan ke project.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const totalTasks =
                project.stages.backlog +
                project.stages.todo +
                project.stages.revision +
                project.stages.inProgress +
                project.stages.inReview +
                project.stages.done;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group tb-tactile-motion flex flex-col justify-between rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-md)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--tb-shadow-lg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={[
                          "rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-0.5 text-[12px] font-bold tracking-[0.07em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]",
                          ACCENT_BG[project.accent],
                        ].join(" ")}
                      >
                        {project.code}
                      </span>
                      <span className="text-[12px] font-bold tabular-nums text-[var(--tb-ink-muted)]">
                        {project.stages.done}/{totalTasks} done
                      </span>
                    </div>

                    <h2 className="mt-3.5 text-[22px] font-bold leading-snug tracking-[-0.02em] text-[var(--tb-ink)] group-hover:underline decoration-2 underline-offset-4">
                      {project.name}
                    </h2>
                    {project.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
                        {project.description}
                      </p>
                    ) : null}

                    <dl className="mt-4 grid grid-cols-3 gap-2 border-t-2 border-[var(--tb-ink)] pt-3.5 text-center">
                      <div className="rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-2 py-1.5">
                        <dt className="text-[11px] font-bold text-[var(--tb-ink-muted)]">
                          Backlog / To Do
                        </dt>
                        <dd className="text-[15px] font-bold tabular-nums text-[var(--tb-ink)]">
                          {project.stages.backlog + project.stages.todo}
                        </dd>
                      </div>
                      <div
                        className={[
                          "rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-1.5",
                          project.stages.revision > 0
                            ? "bg-[var(--tb-secondary)]"
                            : "bg-[var(--tb-bg)]",
                        ].join(" ")}
                      >
                        <dt className="text-[11px] font-bold text-[var(--tb-ink)]">
                          Revision
                        </dt>
                        <dd className="text-[15px] font-bold tabular-nums text-[var(--tb-ink)]">
                          {project.stages.revision}
                        </dd>
                      </div>
                      <div className="rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-2 py-1.5">
                        <dt className="text-[11px] font-bold text-[var(--tb-ink-muted)]">
                          Active / Review
                        </dt>
                        <dd className="text-[15px] font-bold tabular-nums text-[var(--tb-ink)]">
                          {project.stages.inProgress + project.stages.inReview}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-[var(--tb-ink)] pt-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {project.members.slice(0, 4).map((member) => (
                          <span
                            key={member.id}
                            title={member.name}
                            className={[
                              "inline-flex h-8 w-8 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] text-[11px] font-bold text-[var(--tb-ink)]",
                              member.role === "admin"
                                ? "bg-[var(--tb-secondary)]"
                                : "bg-[var(--tb-accent)]",
                            ].join(" ")}
                          >
                            {getInitials(member.name)}
                          </span>
                        ))}
                      </div>
                      <span className="truncate text-[13px] font-semibold text-[var(--tb-ink-muted)]">
                        {project.members.length}{" "}
                        {project.members.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-3 py-1.5 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]">
                      <span>Open Kanban</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
