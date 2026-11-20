"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon, PlusIcon } from "@/components/admin/admin-icons";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import { BrutalButton } from "@/components/login/brutal-button";
import { TechBroMark } from "@/components/login/icons";
import { TaskModal } from "./task-modal";
import {
  KANBAN_COLUMNS,
  TASK_PRIORITY_LABELS,
  type KanbanMember,
  type KanbanTask,
  type TaskCommentItem,
  type TaskPriority,
  type TaskStatus,
} from "./types";

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
  MEDIUM: "bg-[#fde68a] text-[var(--tb-ink)]",
  HIGH: "bg-[var(--tb-secondary)] text-[var(--tb-ink)]",
  URGENT: "bg-[var(--tb-error)] text-white",
};

export function KanbanBoard({
  project,
  members,
  initialTasks,
  currentUser,
}: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [modalVersion, setModalVersion] = useState(0);

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  function openCreateModal(status: TaskStatus = "BACKLOG") {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalVersion((prev) => prev + 1);
    setIsModalOpen(true);
  }

  function openEditModal(task: KanbanTask) {
    setEditingTask(task);
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

  function handleCommentAdded(taskId: string, comment: TaskCommentItem) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, comments: [...task.comments, comment] }
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

  async function handleDrop(event: DragEvent<HTMLElement>, nextStatus: TaskStatus) {
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

    router.refresh();
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh w-full flex-col overflow-x-clip">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)]">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="tb-tactile-motion inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)]"
            >
              <span>← Dashboard</span>
            </Link>

            <span className="hidden shadow-[var(--tb-shadow-xs)] sm:inline-flex">
              <TechBroMark className="h-8 w-8" />
            </span>

            <span
              className={[
                "shrink-0 rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold tracking-[0.07em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]",
                ACCENT_BG[project.accent],
              ].join(" ")}
            >
              {project.code}
            </span>

            <h1 className="truncate text-[17px] font-bold text-[var(--tb-ink)] sm:text-[20px]">
              {project.name}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {currentUser.role === "admin" ? (
              <Link
                href="/admin"
                className="tb-tactile-motion hidden min-h-[40px] items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3 text-[12px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] sm:inline-flex"
              >
                Admin
              </Link>
            ) : null}

            <BrutalButton
              type="button"
              variant="primary"
              onClick={() => openCreateModal("BACKLOG")}
              className="w-auto min-h-[42px] px-3.5 text-[13px]"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>CREATE TASK</span>
            </BrutalButton>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out"
              className="tb-tactile-motion inline-flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-bg)] disabled:opacity-60"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Subheader bar: Description + Team Avatars */}
      <div className="border-b-2 border-[var(--tb-ink)] bg-[var(--tb-surface)]/90">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <p className="text-[13px] font-medium text-[var(--tb-ink-muted)]">
            {project.description || "Drag & drop kartu antar kolom atau klik kartu untuk edit progress & Catatan QC."}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {members.slice(0, 6).map((member) => (
                <span
                  key={member.id}
                  title={`${member.name} (${member.role})`}
                  className={[
                    "inline-flex h-7 w-7 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] text-[10px] font-bold text-[var(--tb-ink)]",
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

      {/* 6-Column Kanban Board */}
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
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-bold uppercase tracking-[0.04em] text-[var(--tb-ink)]">
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
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-primary)]"
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
                            <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--tb-ink)]">
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
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-accent)] text-[9px] font-bold">
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

      {/* Create / Edit Task Popup Modal with Column 2 Catatan QC */}
      {isModalOpen ? (
        <TaskModal
          key={`${editingTask?.id ?? "new"}-${modalVersion}`}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          projectId={project.id}
          members={members}
          currentUserName={currentUser.name}
          defaultStatus={defaultStatus}
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
