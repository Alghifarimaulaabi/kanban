export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "REVISION"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type QcRoleTag = "QC" | "PIC";

export interface KanbanMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface TaskCommentItem {
  id: string;
  content: string;
  roleTag: QcRoleTag;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export type TaskActivityAction =
  | "TASK_CREATED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNEE_CHANGED"
  | "PROGRESS_UPDATED"
  | "SCHEDULE_UPDATED"
  | "DETAILS_UPDATED"
  | "COMMENT_ADDED";

export interface TaskActivityItem {
  id: string;
  action: TaskActivityAction | string;
  summary: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startDate: string; // YYYY-MM-DD or ""
  dueDate: string; // YYYY-MM-DD or ""
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  comments: TaskCommentItem[];
  activities: TaskActivityItem[];
}

export const KANBAN_COLUMNS: {
  id: TaskStatus;
  label: string;
  headerBg: string;
  headerInk: string;
}[] = [
  {
    id: "BACKLOG",
    label: "Backlog",
    headerBg: "bg-[var(--tb-bg)]",
    headerInk: "text-[var(--tb-ink)]",
  },
  {
    id: "TODO",
    label: "To Do",
    headerBg: "bg-[var(--tb-surface)]",
    headerInk: "text-[var(--tb-ink)]",
  },
  {
    id: "REVISION",
    label: "Revision",
    headerBg: "bg-[var(--tb-secondary)]",
    headerInk: "text-[var(--tb-on-accent)]",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    headerBg: "bg-[var(--tb-accent)]",
    headerInk: "text-[var(--tb-on-accent)]",
  },
  {
    id: "IN_REVIEW",
    label: "In Review",
    headerBg: "bg-[var(--tb-amber)]",
    headerInk: "text-[var(--tb-on-accent)]",
  },
  {
    id: "DONE",
    label: "Done",
    headerBg: "bg-[var(--tb-primary)]",
    headerInk: "text-[var(--tb-on-accent)]",
  },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  REVISION: "Revision",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};
