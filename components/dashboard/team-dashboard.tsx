"use client";

import Link from "next/link";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/components/kanban/types";
import { ArrowRightIcon } from "@/components/login/icons";

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

export interface DashboardMyTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectAccent: ProjectAccent;
}

interface TeamDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: "admin" | "member";
  };
  projects: DashboardProjectCard[];
  myTasks: DashboardMyTask[];
}

const ACCENT_BG: Record<ProjectAccent, string> = {
  lime: "bg-[var(--tb-primary)]",
  coral: "bg-[var(--tb-secondary)]",
  violet: "bg-[var(--tb-accent)]",
};

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  LOW: "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
  MEDIUM: "bg-[var(--tb-amber)] text-[var(--tb-on-accent)]",
  HIGH: "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)]",
  URGENT: "bg-[var(--tb-urgent-bg)] text-[var(--tb-urgent-ink)]",
};

const STATUS_STYLE: Record<TaskStatus, string> = {
  BACKLOG: "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
  TODO: "bg-[var(--tb-surface)] text-[var(--tb-ink)]",
  REVISION: "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)]",
  IN_PROGRESS: "bg-[var(--tb-accent)] text-[var(--tb-on-accent)]",
  IN_REVIEW: "bg-[var(--tb-amber)] text-[var(--tb-on-accent)]",
  DONE: "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]",
};

export function TeamDashboard({
  currentUser,
  projects,
  myTasks,
}: TeamDashboardProps) {
  const totals = projects.reduce(
    (acc, project) => {
      acc.active += project.stages.inProgress + project.stages.inReview;
      acc.revision += project.stages.revision;
      acc.done += project.stages.done;
      acc.all +=
        project.stages.backlog +
        project.stages.todo +
        project.stages.revision +
        project.stages.inProgress +
        project.stages.inReview +
        project.stages.done;
      return acc;
    },
    { active: 0, revision: 0, done: 0, all: 0 },
  );

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b-[3px] border-[var(--tb-ink)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[38px]">
            Welcome, {currentUser.name}
          </h1>
          <p className="mt-1.5 max-w-[60ch] text-[15px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
            Track project progress, revision items, and active tasks assigned to you.
          </p>
        </div>

        <Link
          href="/projects"
          className="tb-tactile-motion inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary-hover)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
        >
          <span>All Projects</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI Row */}
      <section
        aria-label="Workspace metrics"
        className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <div className="rounded-[4px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4 shadow-[var(--tb-shadow-xs)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tb-ink-muted)]">
            Projects
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tabular-nums text-[var(--tb-ink)]">
            {projects.length}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-[var(--tb-ink-muted)]">
            {totals.all} total {totals.all === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="rounded-[4px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4 shadow-[var(--tb-shadow-xs)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tb-ink-muted)]">
            In Progress / Review
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tabular-nums text-[var(--tb-ink)]">
            {totals.active}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-[var(--tb-ink-muted)]">
            Active across boards
          </p>
        </div>

        <div
          className={[
            "rounded-[4px] border-2 border-[var(--tb-ink)] p-4 shadow-[var(--tb-shadow-xs)]",
            totals.revision > 0
              ? "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)]"
              : "bg-[var(--tb-surface)] text-[var(--tb-ink)]",
          ].join(" ")}
        >
          <p
            className={[
              "text-[11px] font-bold uppercase tracking-[0.08em]",
              totals.revision > 0 ? "" : "text-[var(--tb-ink-muted)]",
            ].join(" ")}
          >
            Needs Revision
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tabular-nums">
            {totals.revision}
          </p>
          <p
            className={[
              "mt-1.5 text-[12px]",
              totals.revision > 0
                ? "font-semibold"
                : "font-medium text-[var(--tb-ink-muted)]",
            ].join(" ")}
          >
            Waiting on QC / PIC rework
          </p>
        </div>

        <div className="rounded-[4px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4 shadow-[var(--tb-shadow-xs)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tb-ink-muted)]">
              Completed
            </p>
            <span className="h-2.5 w-2.5 rounded-[1px] border border-[var(--tb-ink)] bg-[var(--tb-primary)]" />
          </div>
          <p className="mt-2 text-[32px] font-bold leading-none tabular-nums text-[var(--tb-ink)]">
            {totals.done}
          </p>
          <p className="mt-1.5 text-[12px] font-medium text-[var(--tb-ink-muted)]">
            Done across projects
          </p>
        </div>
      </section>

      {/* Assigned Tasks */}
      <section className="mt-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[var(--tb-ink)]">
              Assigned to You ({myTasks.length})
            </h2>
            <p className="mt-0.5 text-[13px] font-medium text-[var(--tb-ink-muted)]">
              Active tasks prioritized by Revision status and nearest due date.
            </p>
          </div>
          <Link
            href="/my-tasks"
            className="text-[13px] font-bold text-[var(--tb-ink)] underline decoration-2 underline-offset-4 hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
          >
            Manage my created tasks →
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="mt-4 rounded-[4px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-6 py-7 text-center shadow-[var(--tb-shadow-xs)]">
            <p className="text-[14px] font-bold text-[var(--tb-ink)]">
              No active tasks currently assigned to you.
            </p>
            <p className="mt-1 text-[13px] font-medium text-[var(--tb-ink-muted)]">
              Open a project below to pick up or create a new task.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {myTasks.slice(0, 8).map((task) => {
              const isOverdue = Boolean(task.dueDate && task.dueDate < todayIso);
              return (
                <Link
                  key={task.id}
                  href={`/projects/${task.projectId}`}
                  className="tb-tactile-motion flex flex-col justify-between gap-3 rounded-[4px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4 shadow-[var(--tb-shadow-xs)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--tb-shadow-sm)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={[
                          "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--tb-on-accent)]",
                          ACCENT_BG[task.projectAccent],
                        ].join(" ")}
                      >
                        {task.projectCode}
                      </span>
                      <span
                        className={[
                          "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          STATUS_STYLE[task.status],
                        ].join(" ")}
                      >
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                      <span
                        className={[
                          "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          PRIORITY_STYLE[task.priority],
                        ].join(" ")}
                      >
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>

                    {task.dueDate ? (
                      <span
                        className={[
                          "rounded-[2px] border px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                          isOverdue
                            ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] text-[var(--tb-error)]"
                            : "border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)]",
                        ].join(" ")}
                      >
                        {isOverdue ? `Overdue • ${task.dueDate}` : `Due ${task.dueDate}`}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-[15px] font-bold leading-snug text-[var(--tb-ink)]">
                    {task.title}
                  </p>

                  <div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-[var(--tb-ink-muted)]">
                    <span className="truncate">{task.projectName}</span>
                    <span className="shrink-0 tabular-nums font-bold text-[var(--tb-ink)]">
                      {task.progress}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Projects */}
      <section className="mt-9">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[var(--tb-ink)]">
            Projects
          </h2>
          {projects.length > 0 ? (
            <Link
              href="/projects"
              className="text-[13px] font-bold text-[var(--tb-ink)] underline decoration-2 underline-offset-4 hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              View all ({projects.length}) →
            </Link>
          ) : null}
        </div>

        {projects.length === 0 ? (
          <div className="mt-4 rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-10 text-center shadow-[var(--tb-shadow-md)]">
            <h3 className="text-[18px] font-bold text-[var(--tb-ink)]">
              No projects assigned yet
            </h3>
            <p className="mx-auto mt-1.5 max-w-[46ch] text-[14px] font-medium text-[var(--tb-ink-muted)]">
              Contact your workspace administrator to be assigned to a project board.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => {
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
                  className="group tb-tactile-motion flex flex-col justify-between rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--tb-shadow-md)]"
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

                    <h3 className="mt-3 text-[19px] font-bold leading-snug tracking-[-0.02em] text-[var(--tb-ink)] decoration-2 underline-offset-4 group-hover:underline">
                      {project.name}
                    </h3>
                    {project.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
                        {project.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-[var(--tb-ink)] pt-3.5">
                    <div className="flex -space-x-1.5">
                      {project.members.slice(0, 4).map((member) => (
                        <span
                          key={member.id}
                          title={member.name}
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] text-[10px] font-bold text-[var(--tb-on-accent)]",
                            member.role === "admin"
                              ? "bg-[var(--tb-secondary)]"
                              : "bg-[var(--tb-accent)]",
                          ].join(" ")}
                        >
                          {getInitials(member.name)}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-3 py-1 text-[12px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]">
                      <span>Open Board</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
