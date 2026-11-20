export type AccountRole = "admin" | "member";

export type ProjectAccent = "lime" | "coral" | "violet";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  createdAt: string;
  isCurrentAdmin?: boolean;
}

export interface ProjectStageCounts {
  backlog: number;
  todo: number;
  revision: number;
  inProgress: number;
  inReview: number;
  done: number;
}

export interface AdminProject {
  id: string;
  code: string;
  name: string;
  description: string;
  accent: ProjectAccent;
  memberIds: string[];
  stages: ProjectStageCounts;
  createdAt: string;
}

export const INITIAL_ACCOUNTS: AdminAccount[] = [
  {
    id: "usr-devon",
    name: "Devon Brooks",
    email: "devon@techbro.dev",
    role: "admin",
    createdAt: "Nov 10, 2026",
    isCurrentAdmin: true,
  },
  {
    id: "usr-maya",
    name: "Maya Chen",
    email: "maya@techbro.dev",
    role: "member",
    createdAt: "Nov 11, 2026",
  },
  {
    id: "usr-raka",
    name: "Raka Pratama",
    email: "raka@techbro.dev",
    role: "member",
    createdAt: "Nov 14, 2026",
  },
  {
    id: "usr-elena",
    name: "Elena Vasquez",
    email: "elena@techbro.dev",
    role: "member",
    createdAt: "Nov 18, 2026",
  },
];

export const INITIAL_PROJECTS: AdminProject[] = [
  {
    id: "prj-core",
    code: "CORE",
    name: "Core API Platform",
    description:
      "Auth gateway, Prisma 7 PostgreSQL migrations, and team permission boundaries.",
    accent: "lime",
    memberIds: ["usr-devon", "usr-maya", "usr-raka"],
    stages: {
      backlog: 4,
      todo: 3,
      revision: 1,
      inProgress: 2,
      inReview: 2,
      done: 9,
    },
    createdAt: "Nov 12, 2026",
  },
  {
    id: "prj-web",
    code: "WEB",
    name: "Client Kanban Workspace",
    description:
      "Drag-and-drop 6-column delivery board, task detail drawer, and live status filters.",
    accent: "violet",
    memberIds: ["usr-maya", "usr-elena"],
    stages: {
      backlog: 5,
      todo: 4,
      revision: 2,
      inProgress: 3,
      inReview: 1,
      done: 6,
    },
    createdAt: "Nov 15, 2026",
  },
  {
    id: "prj-qa",
    code: "QA",
    name: "Release & QA Pipeline",
    description:
      "Automated E2E regression checks, staging sign-off checklists, and bug triage.",
    accent: "coral",
    memberIds: ["usr-raka", "usr-elena"],
    stages: {
      backlog: 2,
      todo: 2,
      revision: 0,
      inProgress: 1,
      inReview: 2,
      done: 11,
    },
    createdAt: "Nov 18, 2026",
  },
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
