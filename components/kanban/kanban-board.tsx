"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import { PlusIcon } from "@/components/admin/admin-icons";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import { BrutalButton } from "@/components/login/brutal-button";
import { ProjectCalendar } from "./project-calendar";
import { TaskModal } from "./task-modal";
import {
  KANBAN_COLUMNS,
  TASK_PRIORITY_LABELS,
  type KanbanMember,
  type KanbanTask,
  type TaskActivityItem,
  type TaskCommentItem,
  type TaskPriority,
  type TaskStatus,
} from "./types";

export type ProjectViewTab = "kanban" | "calendar";

interface KanbanBoardProps {
  project: {
    id: string;
    code: string;
    name: string;
    description: string;
    accent: ProjectAccent;
  };
  members: KanbanMember[];
  initialTasks: KanbanTask[];
  initialView?: ProjectViewTab;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "member";
  };
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

function KanbanTabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="3" width="4" height="14" />
      <rect x="8" y="3" width="4" height="9" />
      <rect x="13.5" y="3" width="4" height="11.5" />
    </svg>
  );
}

function CalendarTabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="4" width="15" height="13.5" />
      <path d="M2.5 8.5H17.5M6.5 2V5M13.5 2V5" />
    </svg>
  );
}

export function KanbanBoard({
  project,
  members,
  initialTasks,
  initialView = "kanban",
  currentUser,
}: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeView, setActiveView] = useState<ProjectViewTab>(initialView);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [defaultDueDate, setDefaultDueDate] = useState<string>("");
  const [modalVersion, setModalVersion] = useState(0);

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  function switchView(nextView: ProjectViewTab) {
    setActiveView(nextView);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", nextView);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function openCreateModal(status: TaskStatus = "BACKLOG", dueDate = "") {
    setEditingTask(null);
    setDefaultStatus(status);
    setDefaultDueDate(dueDate);
    setModalVersion((prev) => prev + 1);
    setIsModalOpen(true);
  }

  function openEditModal(task: KanbanTask) {
    setEditingTask(task);
    setDefaultDueDate("");
    setModalVersion((prev) => prev + 1);
    setIsModalOpen(true);
  }

  function handleTaskCreated(created: KanbanTask) {
    setTasks((prev) => [created, ...prev]);
    router.refresh();
  }

  function handleTaskUpdated(updated: KanbanTask) {
    setTasks((prev) =>
      prev.map((task) => (task.id === updated.id ? updated : task)),
    );
    router.refresh();
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    router.refresh();
  }

  function handleCommentAdded(
    taskId: string,
    comment: TaskCommentItem,
    activity?: TaskActivityItem,
  ) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [...task.comments, comment],
              activities: activity
                ? [activity, ...task.activities]
                : task.activities,
            }
          : task,
      ),
    );
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, taskId: string) {
    setDraggingTaskId(taskId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
  }

  function handleDragOver(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  }

  async function handleDrop(
    event: DragEvent<HTMLElement>,
    nextStatus: TaskStatus,
  ) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain") || draggingTaskId;
    setDraggingTaskId(null);
    setDragOverColumn(null);

    if (!taskId) return;
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.status === nextStatus) return;

    const previousStatus = targetTask.status;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      ),
    );

    const response = await fetch(
      `/api/projects/${project.id}/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      },
    );

    if (!response.ok) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: previousStatus } : task,
        ),
      );
      return;
    }

    const data = (await response.json().catch(() => null)) as {
      task?: KanbanTask;
    } | null;
    if (data?.task) {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? data.task! : task)),
      );
    }

    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Project Header + 2-Tab Switcher (Kanban | Calendar) */}
      <header className="sticky top-[63px] z-20 border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] lg:top-0">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/projects"
              className="tb-tactile-motion inline-flex min-h-[38px] shrink-0 items-center gap-1 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-2.5 text-[12px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              <span>← Projects</span>
            </Link>

            <span
              className={[
                "shrink-0 rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold tracking-[0.07em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
                ACCENT_BG[project.accent],
              ].join(" ")}
            >
              {project.code}
            </span>

            <h1 className="truncate text-[18px] font-bold text-[var(--tb-ink)] sm:text-[21px]">
              {project.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 2-Tab Switcher: Kanban & Calendar */}
            <div
              role="tablist"
              aria-label="Tampilan project"
              className="inline-flex rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] p-0.5 shadow-[var(--tb-shadow-xs)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "kanban"}
                onClick={() => switchView("kanban")}
                className={[
                  "inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-[2px] px-3 text-[12px] font-bold uppercase tracking-[0.05em] transition-colors",
                  activeView === "kanban"
                    ? "border border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)]"
                    : "text-[var(--tb-ink)] hover:bg-[var(--tb-surface)]",
                ].join(" ")}
              >
                <KanbanTabIcon className="h-3.5 w-3.5" />
                <span>Kanban</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeView === "calendar"}
                onClick={() => switchView("calendar")}
                className={[
                  "inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-[2px] px-3 text-[12px] font-bold uppercase tracking-[0.05em] transition-colors",
                  activeView === "calendar"
                    ? "border border-[var(--tb-ink)] bg-[var(--tb-amber)] text-[var(--tb-on-accent)]"
                    : "text-[var(--tb-ink)] hover:bg-[var(--tb-surface)]",
                ].join(" ")}
              >
                <CalendarTabIcon className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            <BrutalButton
              type="button"
              variant="primary"
              onClick={() => openCreateModal("BACKLOG")}
              className="w-auto min-h-[42px] px-3.5 text-[13px]"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>CREATE TASK</span>
            </BrutalButton>
          </div>
        </div>
      </header>

      {/* Subheader bar: Description + Team Avatars */}
      <div className="border-b-2 border-[var(--tb-ink)] bg-[var(--tb-surface)]/90">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <p className="text-[13px] font-medium text-[var(--tb-ink-muted)]">
            {project.description ||
              (activeView === "kanban"
                ? "Drag & drop kartu antar kolom atau klik kartu untuk edit progress, Catatan QC, & Activity Log."
                : "Lihat jadwal task per bulan, klik tanggal untuk membuat task baru, atau klik task untuk detail.")}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {members.slice(0, 6).map((member) => (
                <span
                  key={member.id}
                  title={`${member.name} (${member.role})`}
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
            <span className="text-[12px] font-bold text-[var(--tb-ink)]">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Kanban or Calendar */}
      {activeView === "calendar" ? (
        <ProjectCalendar
          tasks={tasks}
          onSelectTask={openEditModal}
          onCreateTaskForDate={(dateIso) => openCreateModal("TODO", dateIso)}
        />
      ) : (
        <main className="flex-1 overflow-x-auto px-4 py-5 sm:px-6">
          <div className="mx-auto grid min-w-[1440px] max-w-[1680px] grid-cols-6 items-start gap-4">
            {KANBAN_COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);
              const isOver = dragOverColumn === column.id;

              return (
                <section
                  key={column.id}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={() => {
                    if (dragOverColumn === column.id) setDragOverColumn(null);
                  }}
                  onDrop={(e) => handleDrop(e, column.id)}
                  className={[
                    "flex min-h-[540px] flex-col rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)]/95 shadow-[var(--tb-shadow-sm)] transition-colors",
                    isOver ? "ring-4 ring-[var(--tb-primary)]" : "",
                  ].join(" ")}
                >
                  {/* Column Header */}
                  <div
                    className={[
                      "flex items-center justify-between gap-2 border-b-[3px] border-[var(--tb-ink)] px-3 py-2.5",
                      column.headerBg,
                      column.headerInk,
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold uppercase tracking-[0.04em]">
                        {column.label}
                      </h2>
                      <span className="rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[var(--tb-ink)]">
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCreateModal(column.id)}
                      aria-label={`Add task in ${column.label}`}
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 space-y-3 p-2.5">
                    {columnTasks.length === 0 ? (
                      <div className="rounded-[3px] border-2 border-dashed border-[var(--tb-ink)]/30 p-4 text-center text-[12px] font-medium text-[var(--tb-ink-muted)]">
                        Drop task di sini
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={() => {
                            setDraggingTaskId(null);
                            setDragOverColumn(null);
                          }}
                          onClick={() => openEditModal(task)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openEditModal(task);
                            }
                          }}
                          className={[
                            "tb-tactile-motion cursor-pointer rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-3 shadow-[var(--tb-shadow-xs)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--tb-shadow-sm)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
                            draggingTaskId === task.id ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          {/* Top row: Priority & QC notes badge */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={[
                                "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em]",
                                PRIORITY_STYLE[task.priority],
                              ].join(" ")}
                            >
                              {TASK_PRIORITY_LABELS[task.priority]}
                            </span>

                            {task.comments.length > 0 ? (
                              <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--tb-on-accent)]">
                                QC: {task.comments.length}
                              </span>
                            ) : null}
                          </div>

                          {/* Title */}
                          <h3 className="mt-2 text-[14px] font-bold leading-snug text-[var(--tb-ink)]">
                            {task.title}
                          </h3>

                          {/* Progress Bar */}
                          <div className="mt-2.5">
                            <div className="mb-1 flex items-center justify-between text-[11px] font-bold tabular-nums text-[var(--tb-ink-muted)]">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-bg)]">
                              <div
                                className="h-full bg-[var(--tb-primary)]"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer: PIC + Due Date */}
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--tb-ink)]/25 pt-2 text-[11px]">
                            {task.assignee ? (
                              <span className="flex min-w-0 items-center gap-1.5 font-bold text-[var(--tb-ink)]">
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-accent)] text-[9px] font-bold text-[var(--tb-on-accent)]">
                                  {getInitials(task.assignee.name)}
                                </span>
                                <span className="truncate">
                                  {task.assignee.name}
                                </span>
                              </span>
                            ) : (
                              <span className="font-medium text-[var(--tb-ink-muted)]">
                                Unassigned
                              </span>
                            )}

                            {task.dueDate ? (
                              <span className="shrink-0 font-semibold tabular-nums text-[var(--tb-ink-muted)]">
                                Due {task.dueDate}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      )}

      {/* Create / Edit Task Popup Modal with Catatan QC + Activity Log Tabs */}
      {isModalOpen ? (
        <TaskModal
          key={`${editingTask?.id ?? "new"}-${modalVersion}`}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
            setDefaultDueDate("");
          }}
          projectId={project.id}
          members={members}
          currentUserName={currentUser.name}
          defaultStatus={defaultStatus}
          defaultDueDate={defaultDueDate}
          editingTask={editingTask}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onCommentAdded={handleCommentAdded}
        />
      ) : null}
    </div>
  );
}
