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

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
