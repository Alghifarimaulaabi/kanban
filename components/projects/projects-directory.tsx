"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/admin/admin-icons";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import type { DashboardProjectCard } from "@/components/dashboard/team-dashboard";
import { ArrowRightIcon } from "@/components/login/icons";

interface ProjectsDirectoryProps {
  projects: DashboardProjectCard[];
  isAdmin: boolean;
}

const ACCENT_BG: Record<ProjectAccent, string> = {
  lime: "bg-[var(--tb-primary)]",
  coral: "bg-[var(--tb-secondary)]",
  violet: "bg-[var(--tb-accent)]",
};

export function ProjectsDirectory({
  projects,
  isAdmin,
}: ProjectsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(q) ||
        project.code.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q),
    );
  }, [projects, searchQuery]);

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 border-b-[3px] border-[var(--tb-ink)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[40px]">
            Projects
          </h1>
          <p className="mt-2 max-w-[58ch] text-[15px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
            Pilih project di bawah untuk membuka Kanban board atau tampilan Calendar tim.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[280px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tb-ink-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari kode atau nama project..."
              aria-label="Search projects"
              className="min-h-[44px] w-full rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] py-2 pl-9 pr-3 text-[13px] font-semibold text-[var(--tb-ink)] placeholder:text-[var(--tb-placeholder)] shadow-[var(--tb-shadow-xs)] focus:bg-[var(--tb-surface-focus)] focus:outline-none"
            />
          </div>

          {isAdmin ? (
            <Link
              href="/admin"
              className="tb-tactile-motion inline-flex min-h-[44px] items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary-hover)]"
            >
              Kelola di Admin
            </Link>
          ) : null}
        </div>
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
      ) : filteredProjects.length === 0 ? (
        <div className="mt-8 rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-8 text-center shadow-[var(--tb-shadow-sm)]">
          <p className="text-[15px] font-bold text-[var(--tb-ink)]">
            Tidak ada project yang cocok dengan &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const totalTasks =
              project.stages.backlog +
              project.stages.todo +
              project.stages.revision +
              project.stages.inProgress +
              project.stages.inReview +
              project.stages.done;

            return (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-md)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-0.5 text-[12px] font-bold tracking-[0.07em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
                        ACCENT_BG[project.accent],
                      ].join(" ")}
                    >
                      {project.code}
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-[var(--tb-ink-muted)]">
                      {project.stages.done}/{totalTasks} done
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="mt-3.5 block text-[22px] font-bold leading-snug tracking-[-0.02em] text-[var(--tb-ink)] decoration-2 underline-offset-4 hover:underline"
                  >
                    {project.name}
                  </Link>
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
                          ? "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)]"
                          : "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
                      ].join(" ")}
                    >
                      <dt className="text-[11px] font-bold">Revision</dt>
                      <dd className="text-[15px] font-bold tabular-nums">
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

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--tb-ink)] pt-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {project.members.slice(0, 4).map((member) => (
                        <span
                          key={member.id}
                          title={member.name}
                          className={[
                            "inline-flex h-8 w-8 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] text-[11px] font-bold text-[var(--tb-on-accent)]",
                            member.role === "admin"
                              ? "bg-[var(--tb-secondary)]"
                              : "bg-[var(--tb-accent)]",
                          ].join(" ")}
                        >
                          {getInitials(member.name)}
                        </span>
                      ))}
                    </div>
                    <span className="truncate text-[12px] font-semibold text-[var(--tb-ink-muted)]">
                      {project.members.length}{" "}
                      {project.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${project.id}?view=calendar`}
                      className="tb-tactile-motion inline-flex min-h-[38px] items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-2.5 text-[12px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-amber)] hover:text-[var(--tb-on-accent)]"
                    >
                      Calendar
                    </Link>
                    <Link
                      href={`/projects/${project.id}`}
                      className="tb-tactile-motion inline-flex min-h-[38px] items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-3 text-[12px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary-hover)]"
                    >
                      <span>Kanban</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
