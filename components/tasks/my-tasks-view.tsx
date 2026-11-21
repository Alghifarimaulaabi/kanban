"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CloseIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/admin/admin-icons";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import {
  KANBAN_COLUMNS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/components/kanban/types";
import { ArrowRightIcon } from "@/components/login/icons";

export interface CreatedTaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate: string;
  createdAt: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectAccent: ProjectAccent;
  assignee: {
    id: string;
    name: string;
  } | null;
}

interface MyTasksViewProps {
  initialTasks: CreatedTaskItem[];
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

function formatCreatedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function MyTasksView({ initialTasks }: MyTasksViewProps) {
  const router = useRouter();
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  const [tasks, setTasks] = useState<CreatedTaskItem[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function syncCreatedTasks() {
      try {
        const response = await fetch("/api/my-tasks", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json().catch(() => null)) as {
          tasks?: CreatedTaskItem[];
        } | null;
        if (!Array.isArray(data?.tasks)) return;

        const nextTasks = data.tasks;
        const isStaleSnapshot =
          nextTasks.length !== initialTasks.length ||
          nextTasks.some(
            (item, index) =>
              item.id !== initialTasks[index]?.id ||
              item.status !== initialTasks[index]?.status ||
              item.title !== initialTasks[index]?.title ||
              item.progress !== initialTasks[index]?.progress ||
              item.dueDate !== initialTasks[index]?.dueDate ||
              item.assignee?.id !== initialTasks[index]?.assignee?.id,
          );

        if (isStaleSnapshot) {
          setTasks(nextTasks);
          router.refresh();
        }
      } catch {
        // Ignore abort or transient network errors; SSR props remain visible.
      }
    }

    void syncCreatedTasks();
    return () => controller.abort();
  }, [initialTasks, router]);

  const todayIso = new Date().toISOString().slice(0, 10);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (!q) return true;
      return (
        task.title.toLowerCase().includes(q) ||
        task.projectName.toLowerCase().includes(q) ||
        task.projectCode.toLowerCase().includes(q) ||
        (task.assignee?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tasks, searchQuery, statusFilter]);

  async function handleDeleteTask(task: CreatedTaskItem) {
    setDeletingId(task.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/my-tasks/${task.id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setNotice({
          tone: "error",
          message: data?.error || "Failed to delete task. Please try again.",
        });
        return;
      }

      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      setConfirmDeleteId(null);
      setNotice({
        tone: "success",
        message: `Deleted task "${task.title}" from ${task.projectCode}.`,
      });
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        message: "Connection error while deleting task. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b-[3px] border-[var(--tb-ink)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[38px]">
            My Tasks
          </h1>
          <p className="mt-1.5 max-w-[60ch] text-[15px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
            Review and delete tasks that you created across your projects.
          </p>
        </div>

        <Link
          href="/projects"
          className="tb-tactile-motion inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary-hover)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
        >
          <span>Open Projects</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Feedback Banner */}
      {notice ? (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={[
            "mt-5 flex items-center justify-between gap-3 rounded-[3px] border-2 px-4 py-3 text-[13px] font-bold shadow-[var(--tb-shadow-xs)]",
            notice.tone === "error"
              ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] text-[var(--tb-error)]"
              : "border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)]",
          ].join(" ")}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Search & Status Filter Toolbar */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={[
              "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em]",
              statusFilter === "ALL"
                ? "bg-[var(--tb-ink)] text-[var(--tb-surface)] shadow-[var(--tb-shadow-xs)]"
                : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
            ].join(" ")}
          >
            All ({tasks.length})
          </button>
          {KANBAN_COLUMNS.map((col) => {
            const count = tasks.filter((t) => t.status === col.id).length;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setStatusFilter(col.id)}
                className={[
                  "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em]",
                  statusFilter === col.id
                    ? `${col.headerBg} ${col.headerInk} shadow-[var(--tb-shadow-xs)]`
                    : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                ].join(" ")}
              >
                {col.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-[290px]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tb-ink-muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Filter by task, project, or PIC..."
            aria-label="Search my created tasks"
            className="min-h-[42px] w-full rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] py-2 pl-9 pr-3 text-[13px] font-semibold text-[var(--tb-ink)] placeholder:text-[var(--tb-placeholder)] shadow-[var(--tb-shadow-xs)] focus:bg-[var(--tb-surface-focus)] focus:outline-none focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
          />
        </div>
      </div>

      {/* Tasks Table / List */}
      <section className="mt-5">
        {tasks.length === 0 ? (
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-10 text-center shadow-[var(--tb-shadow-md)]">
            <h2 className="text-[20px] font-bold text-[var(--tb-ink)]">
              No tasks created by you yet
            </h2>
            <p className="mx-auto mt-1.5 max-w-[46ch] text-[14px] font-medium text-[var(--tb-ink-muted)]">
              Tasks you create inside any project Kanban board or Calendar will appear here so you can track or remove them anytime.
            </p>
            <div className="mt-5">
              <Link
                href="/projects"
                className="tb-tactile-motion inline-flex min-h-[44px] items-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-4 text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary-hover)]"
              >
                <span>Go to Projects</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-8 text-center shadow-[var(--tb-shadow-sm)]">
            <p className="text-[15px] font-bold text-[var(--tb-ink)]">
              No tasks match the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="mt-3 inline-flex min-h-[40px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3.5 text-[12px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-md)]">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--tb-ink)]">
                    <th scope="col" className="px-4 py-3">
                      Task
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Project
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Priority
                    </th>
                    <th scope="col" className="px-4 py-3">
                      PIC
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Progress / Due
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[var(--tb-ink)]">
                  {filteredTasks.map((task) => {
                    const isConfirming = confirmDeleteId === task.id;
                    const isDeleting = deletingId === task.id;
                    const isOverdue = Boolean(
                      task.dueDate &&
                        task.dueDate < todayIso &&
                        task.status !== "DONE",
                    );

                    return (
                      <tr
                        key={task.id}
                        className="transition-colors hover:bg-[var(--tb-surface-focus)]"
                      >
                        <td className="max-w-[320px] px-4 py-3.5">
                          <Link
                            href={`/projects/${task.projectId}`}
                            className="block truncate text-[14px] font-bold text-[var(--tb-ink)] decoration-2 underline-offset-4 hover:underline"
                          >
                            {task.title}
                          </Link>
                          <p className="mt-0.5 text-[11px] font-medium text-[var(--tb-ink-muted)]">
                            Created {formatCreatedDate(task.createdAt)}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <Link
                            href={`/projects/${task.projectId}`}
                            className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--tb-ink)] hover:underline"
                          >
                            <span
                              className={[
                                "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--tb-on-accent)]",
                                ACCENT_BG[task.projectAccent],
                              ].join(" ")}
                            >
                              {task.projectCode}
                            </span>
                            <span className="max-w-[140px] truncate">
                              {task.projectName}
                            </span>
                          </Link>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={[
                              "inline-flex whitespace-nowrap rounded-[2px] border border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold uppercase",
                              STATUS_STYLE[task.status],
                            ].join(" ")}
                          >
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={[
                              "inline-flex whitespace-nowrap rounded-[2px] border border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold uppercase",
                              PRIORITY_STYLE[task.priority],
                            ].join(" ")}
                          >
                            {TASK_PRIORITY_LABELS[task.priority]}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {task.assignee ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--tb-ink)]">
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-accent)] text-[10px] font-bold text-[var(--tb-on-accent)]">
                                {getInitials(task.assignee.name)}
                              </span>
                              <span className="max-w-[110px] truncate">
                                {task.assignee.name}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[12px] font-medium text-[var(--tb-ink-muted)]">
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[12px] font-bold tabular-nums text-[var(--tb-ink)]">
                              {task.progress}%
                            </span>
                            {task.dueDate ? (
                              <span
                                className={[
                                  "text-[11px] font-bold tabular-nums",
                                  isOverdue
                                    ? "text-[var(--tb-error)]"
                                    : "text-[var(--tb-ink-muted)]",
                                ].join(" ")}
                              >
                                {isOverdue
                                  ? `Overdue • ${task.dueDate}`
                                  : `Due ${task.dueDate}`}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-[var(--tb-ink-muted)]">
                                No due date
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {isConfirming ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteTask(task)}
                                className="inline-flex min-h-[38px] cursor-pointer items-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3 text-[12px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:brightness-95 disabled:opacity-60"
                              >
                                {isDeleting ? "Deleting..." : "Confirm"}
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setConfirmDeleteId(null)}
                                className="inline-flex min-h-[38px] cursor-pointer items-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-2.5 text-[12px] font-bold text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(task.id)}
                              aria-label={`Delete task ${task.title}`}
                              className="tb-tactile-motion inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[12px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked List */}
            <ul className="divide-y-2 divide-[var(--tb-ink)] md:hidden">
              {filteredTasks.map((task) => {
                const isConfirming = confirmDeleteId === task.id;
                const isDeleting = deletingId === task.id;

                return (
                  <li key={task.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={[
                          "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--tb-on-accent)]",
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

                    <div>
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="text-[15px] font-bold leading-snug text-[var(--tb-ink)] hover:underline"
                      >
                        {task.title}
                      </Link>
                      <p className="mt-1 text-[12px] font-medium text-[var(--tb-ink-muted)]">
                        {task.projectName} • {task.progress}%
                        {task.dueDate ? ` • Due ${task.dueDate}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="inline-flex min-h-[40px] items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 text-[12px] font-bold text-[var(--tb-ink)]"
                      >
                        Open Board
                      </Link>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteTask(task)}
                            className="inline-flex min-h-[40px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3 text-[12px] font-bold text-[var(--tb-on-accent)]"
                          >
                            {isDeleting ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setConfirmDeleteId(null)}
                            className="inline-flex min-h-[40px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[12px] font-bold text-[var(--tb-ink)]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(task.id)}
                          className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[12px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)]"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
