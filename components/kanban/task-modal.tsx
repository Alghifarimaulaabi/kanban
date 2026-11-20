"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CloseIcon, TrashIcon } from "@/components/admin/admin-icons";
import { getInitials } from "@/components/admin/types";
import { BrutalButton } from "@/components/login/brutal-button";
import { BrutalInput } from "@/components/login/brutal-input";
import {
  KANBAN_COLUMNS,
  TASK_PRIORITY_LABELS,
  type KanbanMember,
  type KanbanTask,
  type QcRoleTag,
  type TaskActivityItem,
  type TaskCommentItem,
  type TaskPriority,
  type TaskStatus,
} from "./types";

type SideTab = "qc" | "activity";

const ACTIVITY_BADGE: Record<string, { label: string; style: string }> = {
  TASK_CREATED: {
    label: "CREATED",
    style: "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]",
  },
  STATUS_CHANGED: {
    label: "STATUS",
    style: "bg-[var(--tb-accent)] text-[var(--tb-on-accent)]",
  },
  PRIORITY_CHANGED: {
    label: "PRIORITY",
    style: "bg-[var(--tb-amber)] text-[var(--tb-on-accent)]",
  },
  ASSIGNEE_CHANGED: {
    label: "ASSIGNEE",
    style: "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
  },
  PROGRESS_UPDATED: {
    label: "PROGRESS",
    style: "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]",
  },
  SCHEDULE_UPDATED: {
    label: "SCHEDULE",
    style: "bg-[var(--tb-amber)] text-[var(--tb-on-accent)]",
  },
  DETAILS_UPDATED: {
    label: "EDIT",
    style: "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
  },
  COMMENT_ADDED: {
    label: "QC NOTE",
    style: "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)]",
  },
};

interface DraftNote {
  id: string;
  content: string;
  roleTag: QcRoleTag;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: KanbanMember[];
  currentUserName: string;
  defaultStatus?: TaskStatus;
  defaultDueDate?: string;
  editingTask?: KanbanTask | null;
  onTaskCreated: (task: KanbanTask) => void;
  onTaskUpdated: (task: KanbanTask) => void;
  onTaskDeleted: (taskId: string) => void;
  onCommentAdded: (
    taskId: string,
    comment: TaskCommentItem,
    activity?: TaskActivityItem,
  ) => void;
}

function formatCommentTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function TaskModal({
  isOpen,
  onClose,
  projectId,
  members,
  currentUserName,
  defaultStatus = "BACKLOG",
  defaultDueDate = "",
  editingTask,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onCommentAdded,
}: TaskModalProps) {
  const isEditMode = Boolean(editingTask);

  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [description, setDescription] = useState(
    editingTask?.description ?? "",
  );
  const [status, setStatus] = useState<TaskStatus>(
    editingTask?.status ?? defaultStatus,
  );
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask?.priority ?? "MEDIUM",
  );
  const [assigneeId, setAssigneeId] = useState(editingTask?.assigneeId ?? "");
  const [startDate, setStartDate] = useState(editingTask?.startDate ?? "");
  const [dueDate, setDueDate] = useState(
    editingTask?.dueDate ?? defaultDueDate,
  );
  const [progress, setProgress] = useState<number>(editingTask?.progress ?? 0);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Column 2: Tab Catatan QC & Activity Log
  const [sideTab, setSideTab] = useState<SideTab>("qc");
  const [comments, setComments] = useState<TaskCommentItem[]>(
    editingTask?.comments ?? [],
  );
  const [activities, setActivities] = useState<TaskActivityItem[]>(
    editingTask?.activities ?? [],
  );
  const [draftNotes, setDraftNotes] = useState<DraftNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteRoleTag, setNoteRoleTag] = useState<QcRoleTag>("QC");
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError("Task name wajib diisi.");
      return;
    }

    if (startDate && dueDate && dueDate < startDate) {
      setFormError("Due date tidak boleh lebih awal dari start date.");
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && editingTask) {
        const res = await fetch(
          `/api/projects/${projectId}/tasks/${editingTask.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: trimmedTitle,
              description,
              status,
              priority,
              assigneeId: assigneeId || null,
              startDate: startDate || null,
              dueDate: dueDate || null,
              progress,
            }),
          },
        );
        const data = (await res.json().catch(() => null)) as {
          task?: KanbanTask;
          error?: string;
        } | null;

        if (!res.ok || !data?.task) {
          setFormError(data?.error || "Gagal menyimpan perubahan task.");
          setIsSaving(false);
          return;
        }

        onTaskUpdated(data.task);
        onClose();
      } else {
        const pendingNotes = [...draftNotes];
        if (noteInput.trim()) {
          pendingNotes.push({
            id: "pending-inline",
            content: noteInput.trim(),
            roleTag: noteRoleTag,
          });
        }

        const res = await fetch(`/api/projects/${projectId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            description,
            status,
            priority,
            assigneeId: assigneeId || null,
            startDate: startDate || null,
            dueDate: dueDate || null,
            progress,
            initialNotes: pendingNotes.map((n) => ({
              content: n.content,
              roleTag: n.roleTag,
            })),
          }),
        });

        const data = (await res.json().catch(() => null)) as {
          task?: KanbanTask;
          error?: string;
        } | null;

        if (!res.ok || !data?.task) {
          setFormError(data?.error || "Gagal membuat task.");
          setIsSaving(false);
          return;
        }

        onTaskCreated(data.task);
        onClose();
      }
    } catch {
      setFormError("Terjadi kesalahan koneksi. Coba lagi.");
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingTask) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${editingTask.id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        onTaskDeleted(editingTask.id);
        onClose();
      } else {
        setFormError("Gagal menghapus task.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAddNote() {
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    setNoteError(null);

    if (!isEditMode || !editingTask) {
      setDraftNotes((prev) => [
        ...prev,
        {
          id: `draft-${Date.now()}`,
          content: trimmed,
          roleTag: noteRoleTag,
        },
      ]);
      setNoteInput("");
      return;
    }

    setIsPostingNote(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${editingTask.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: trimmed,
            roleTag: noteRoleTag,
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        comment?: TaskCommentItem;
        activity?: TaskActivityItem;
        error?: string;
      } | null;

      if (!res.ok || !data?.comment) {
        setNoteError(data?.error || "Gagal mengirim catatan QC.");
        return;
      }

      setComments((prev) => [...prev, data.comment!]);
      if (data.activity) {
        setActivities((prev) => [data.activity!, ...prev]);
      }
      onCommentAdded(editingTask.id, data.comment, data.activity);
      setNoteInput("");
    } catch {
      setNoteError("Gagal mengirim catatan QC.");
    } finally {
      setIsPostingNote(false);
    }
  }

  const selectClass =
    "block min-h-[46px] w-full rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 py-2 text-[14px] font-semibold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] focus:bg-[var(--tb-surface-focus)] focus:shadow-[var(--tb-shadow-sm)] focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--tb-overlay)] p-3 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="flex max-h-[92dvh] w-full max-w-[1000px] flex-col overflow-hidden rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-lg)]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="task-modal-title"
              className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[var(--tb-ink)]"
            >
              {isEditMode ? "Detail & Edit Task" : "Create New Task"}
            </h2>
            <p className="mt-0.5 text-[13px] font-medium text-[var(--tb-ink-muted)]">
              Atur detail task, progress, dan catatan QC/PIC di panel samping.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="tb-tactile-motion inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.2fr_0.8fr] lg:overflow-hidden">
          {/* KOLOM 1: Task Form */}
          <form
            id="task-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 p-5 sm:p-6 lg:overflow-y-auto lg:border-r-[3px] lg:border-[var(--tb-ink)]"
          >
            {formError ? (
              <div
                role="alert"
                className="rounded-[3px] border-2 border-[var(--tb-error)] bg-[var(--tb-error-bg)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--tb-error)]"
              >
                {formError}
              </div>
            ) : null}

            <BrutalInput
              id="task-title"
              label="Task Name"
              placeholder="Contoh: Integrasi API Payment Callback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label
                htmlFor="task-description"
                className="block text-[14px] font-bold text-[var(--tb-ink)]"
              >
                Description
              </label>
              <textarea
                id="task-description"
                rows={3}
                placeholder="Detail pekerjaan, acceptance criteria, atau referensi teknis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full resize-y rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3.5 py-2.5 text-[14px] font-medium text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] placeholder:text-[var(--tb-placeholder)] focus:bg-[var(--tb-surface-focus)] focus:shadow-[var(--tb-shadow-sm)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="task-status"
                  className="block text-[14px] font-bold text-[var(--tb-ink)]"
                >
                  Status
                </label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className={selectClass}
                >
                  {KANBAN_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="task-priority"
                  className="block text-[14px] font-bold text-[var(--tb-ink)]"
                >
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={selectClass}
                >
                  {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {TASK_PRIORITY_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="task-pic"
                className="block text-[14px] font-bold text-[var(--tb-ink)]"
              >
                PIC (Person In Charge)
              </label>
              <select
                id="task-pic"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={selectClass}
              >
                <option value="">— Belum ditentukan —</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="task-start-date"
                  className="block text-[14px] font-bold text-[var(--tb-ink)]"
                >
                  Start Date
                </label>
                <input
                  id="task-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={selectClass}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="task-due-date"
                  className="block text-[14px] font-bold text-[var(--tb-ink)]"
                >
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={selectClass}
                />
              </div>
            </div>

            {/* Progress Bar 0 - 100% */}
            <div className="space-y-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] p-3.5 shadow-[var(--tb-shadow-xs)]">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="task-progress"
                  className="text-[14px] font-bold text-[var(--tb-ink)]"
                >
                  Progress
                </label>
                <span className="rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-2 py-0.5 text-[13px] font-bold tabular-nums text-[var(--tb-on-accent)]">
                  {progress}%
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="h-4 w-full overflow-hidden rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)]">
                <div
                  className="h-full bg-[var(--tb-primary)] transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <input
                id="task-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full cursor-pointer accent-[var(--tb-ink)]"
              />

              <div className="flex items-center justify-between gap-1.5">
                {[0, 25, 50, 75, 100].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setProgress(step)}
                    className={[
                      "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold tabular-nums",
                      progress === step
                        ? "bg-[var(--tb-ink)] text-[var(--tb-surface)]"
                        : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]",
                    ].join(" ")}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--tb-ink)] pt-4">
              {isEditMode ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="tb-tactile-motion inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3.5 text-[13px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:brightness-95 disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete Task"}</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2.5">
                <BrutalButton
                  type="button"
                  variant="surface"
                  onClick={onClose}
                  className="w-auto min-w-[100px]"
                >
                  Cancel
                </BrutalButton>
                <BrutalButton
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  loadingLabel="SAVING..."
                  className="w-auto min-w-[155px]"
                >
                  {isEditMode ? "SAVE TASK" : "CREATE TASK"}
                </BrutalButton>
              </div>
            </div>
          </form>

          {/* KOLOM 2: Tab Catatan QC & Activity Log */}
          <aside className="flex flex-col border-t-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)] lg:overflow-hidden lg:border-t-0">
            {/* Tab Switcher Header */}
            <div className="border-b-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-4 pt-3 pb-3">
              <div
                role="tablist"
                aria-label="Panel QA/QC dan Activity Log"
                className="grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sideTab === "qc"}
                  onClick={() => setSideTab("qc")}
                  className={[
                    "tb-tactile-motion inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] px-2.5 text-[12px] font-bold uppercase tracking-[0.04em]",
                    sideTab === "qc"
                      ? "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                      : "bg-[var(--tb-bg)] text-[var(--tb-ink)] hover:bg-[var(--tb-surface-focus)]",
                  ].join(" ")}
                >
                  <span>Catatan QC</span>
                  <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--tb-ink)]">
                    {isEditMode ? comments.length : draftNotes.length}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={sideTab === "activity"}
                  onClick={() => setSideTab("activity")}
                  className={[
                    "tb-tactile-motion inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] px-2.5 text-[12px] font-bold uppercase tracking-[0.04em]",
                    sideTab === "activity"
                      ? "bg-[var(--tb-accent)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                      : "bg-[var(--tb-bg)] text-[var(--tb-ink)] hover:bg-[var(--tb-surface-focus)]",
                  ].join(" ")}
                >
                  <span>Activity Log</span>
                  <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--tb-ink)]">
                    {activities.length}
                  </span>
                </button>
              </div>
              <p className="mt-2 text-[12px] font-medium text-[var(--tb-ink-muted)]">
                {sideTab === "qc"
                  ? "Khusus laporan bug dari QC & update perbaikan dari PIC."
                  : "Riwayat otomatis perpindahan kolom, perubahan field, & catatan QC."}
              </p>
            </div>

            {sideTab === "qc" ? (
              <>
                {/* Comments List */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4 min-h-[200px] max-h-[340px] lg:max-h-none">
                  {isEditMode ? (
                    comments.length === 0 ? (
                      <div className="rounded-[3px] border-2 border-dashed border-[var(--tb-ink)]/50 bg-[var(--tb-surface)]/70 p-4 text-center text-[13px] font-medium text-[var(--tb-ink-muted)]">
                        Belum ada catatan QC atau perbaikan bug untuk task ini.
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-3 shadow-[var(--tb-shadow-xs)]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "rounded-[2px] border-2 border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--tb-on-accent)]",
                                  comment.roleTag === "QC"
                                    ? "bg-[var(--tb-secondary)]"
                                    : "bg-[var(--tb-primary)]",
                                ].join(" ")}
                              >
                                {comment.roleTag}
                              </span>
                              <span className="text-[13px] font-bold text-[var(--tb-ink)]">
                                {comment.author.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-[var(--tb-ink-muted)]">
                              {formatCommentTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-[var(--tb-ink)]">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    )
                  ) : draftNotes.length === 0 ? (
                    <div className="rounded-[3px] border-2 border-dashed border-[var(--tb-ink)]/50 bg-[var(--tb-surface)]/70 p-4 text-center text-[13px] font-medium text-[var(--tb-ink-muted)]">
                      Tambahkan catatan awal QC/PIC di bawah jika perlu (akan tersimpan saat task dibuat).
                    </div>
                  ) : (
                    draftNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-3 shadow-[var(--tb-shadow-xs)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                "rounded-[2px] border-2 border-[var(--tb-ink)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--tb-on-accent)]",
                                note.roleTag === "QC"
                                  ? "bg-[var(--tb-secondary)]"
                                  : "bg-[var(--tb-primary)]",
                              ].join(" ")}
                            >
                              {note.roleTag}
                            </span>
                            <span className="text-[13px] font-bold text-[var(--tb-ink)]">
                              {currentUserName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDraftNotes((prev) =>
                                prev.filter((item) => item.id !== note.id),
                              )
                            }
                            className="cursor-pointer text-[11px] font-bold text-[var(--tb-error)] hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-[var(--tb-ink)]">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Composer */}
                <div className="border-t-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteRoleTag("QC")}
                      className={[
                        "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-1 text-[11px] font-bold",
                        noteRoleTag === "QC"
                          ? "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                          : "bg-[var(--tb-bg)] text-[var(--tb-ink-muted)]",
                      ].join(" ")}
                    >
                      QC • Temuan Bug
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteRoleTag("PIC")}
                      className={[
                        "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-1 text-[11px] font-bold",
                        noteRoleTag === "PIC"
                          ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                          : "bg-[var(--tb-bg)] text-[var(--tb-ink-muted)]",
                      ].join(" ")}
                    >
                      PIC • Perbaikan Bug
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={
                      noteRoleTag === "QC"
                        ? "Tulis temuan bug, langkah reproduksi, atau catatan revisi..."
                        : "Tulis catatan perbaikan bug atau hasil verifikasi PIC..."
                    }
                    className="block w-full resize-none rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 py-2 text-[13px] font-medium text-[var(--tb-ink)] placeholder:text-[var(--tb-placeholder)] focus:bg-[var(--tb-surface)] focus:outline-none"
                  />

                  {noteError ? (
                    <p className="mt-1.5 text-[12px] font-bold text-[var(--tb-error)]">
                      {noteError}
                    </p>
                  ) : null}

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--tb-ink-muted)]">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-accent)] text-[9px] font-bold text-[var(--tb-on-accent)]">
                        {getInitials(currentUserName)}
                      </span>
                      {currentUserName}
                    </span>

                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={isPostingNote || !noteInput.trim()}
                      className="tb-tactile-motion inline-flex min-h-[38px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-ink)] px-3.5 text-[12px] font-bold text-[var(--tb-surface)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-ink-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPostingNote
                        ? "Mengirim..."
                        : isEditMode
                          ? "Kirim Catatan"
                          : "Tambah Catatan"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Activity Log Timeline */
              <div className="flex-1 space-y-2.5 overflow-y-auto p-4 min-h-[260px] max-h-[420px] lg:max-h-none">
                {!isEditMode ? (
                  <div className="rounded-[3px] border-2 border-dashed border-[var(--tb-ink)]/50 bg-[var(--tb-surface)]/80 p-4 text-[13px] font-medium text-[var(--tb-ink-muted)]">
                    <p className="font-bold text-[var(--tb-ink)]">
                      Preview Activity Log
                    </p>
                    <p className="mt-1">
                      Begitu kamu klik <span className="font-bold text-[var(--tb-ink)]">CREATE TASK</span>, sistem akan otomatis mencatat:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px]">
                      <li>Pembuatan task oleh <span className="font-bold text-[var(--tb-ink)]">{currentUserName}</span></li>
                      {draftNotes.length > 0 ? (
                        <li>{draftNotes.length} catatan awal QC/PIC yang ditambahkan</li>
                      ) : null}
                      <li>Setiap perpindahan kolom, perubahan jadwal, progress, &amp; catatan QC berikutnya</li>
                    </ul>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="rounded-[3px] border-2 border-dashed border-[var(--tb-ink)]/50 bg-[var(--tb-surface)]/70 p-4 text-center text-[13px] font-medium text-[var(--tb-ink-muted)]">
                    Belum ada riwayat aktivitas tercatat untuk task ini.
                  </div>
                ) : (
                  activities.map((activity) => {
                    const badge = ACTIVITY_BADGE[activity.action] ?? {
                      label: "UPDATE",
                      style: "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
                    };
                    return (
                      <div
                        key={activity.id}
                        className="rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-3 shadow-[var(--tb-shadow-xs)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-accent)] text-[10px] font-bold text-[var(--tb-on-accent)]">
                              {getInitials(activity.actor.name)}
                            </span>
                            <span className="truncate text-[12px] font-bold text-[var(--tb-ink)]">
                              {activity.actor.name}
                            </span>
                            <span
                              className={[
                                "shrink-0 rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em]",
                                badge.style,
                              ].join(" ")}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="shrink-0 text-[10px] font-semibold text-[var(--tb-ink-muted)]">
                            {formatCommentTime(activity.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] font-medium leading-snug text-[var(--tb-ink)]">
                          {activity.summary}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
