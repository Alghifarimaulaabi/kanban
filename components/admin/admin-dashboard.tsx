"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BrutalButton } from "@/components/login/brutal-button";
import { AccountModal } from "./account-modal";
import {
  CloseIcon,
  FolderBoardIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "./admin-icons";
import { ProjectModal } from "./project-modal";
import {
  getInitials,
  type AccountRole,
  type AdminAccount,
  type AdminProject,
  type ProjectAccent,
} from "./types";

type ActiveTab = "projects" | "accounts";

const ACCENT_BG: Record<ProjectAccent, string> = {
  lime: "bg-[var(--tb-primary)]",
  coral: "bg-[var(--tb-secondary)]",
  violet: "bg-[var(--tb-accent)]",
};

interface AdminDashboardProps {
  initialAccounts: AdminAccount[];
  initialProjects: AdminProject[];
}

export function AdminDashboard({
  initialAccounts,
  initialProjects,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalVersion, setAccountModalVersion] = useState(0);

  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(
    null,
  );
  const [confirmDeleteAccountId, setConfirmDeleteAccountId] = useState<string | null>(
    null,
  );

  const accountById = useMemo(
    () => new Map(accounts.map((acc) => [acc.id, acc])),
    [accounts],
  );

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

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(q) ||
        account.email.toLowerCase().includes(q) ||
        account.role.toLowerCase().includes(q),
    );
  }, [accounts, searchQuery]);

  function openCreateProjectModal() {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }

  function openEditProjectModal(project: AdminProject) {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  }

  function openAddAccountModal() {
    setAccountModalVersion((prev) => prev + 1);
    setIsAccountModalOpen(true);
  }

  async function handleSaveProject(payload: {
    id?: string;
    name: string;
    code: string;
    description: string;
    accent: ProjectAccent;
    memberIds: string[];
  }): Promise<string | void> {
    if (payload.id) {
      const response = await fetch(`/api/admin/projects/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        return data?.error || "Failed to update project.";
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === payload.id
            ? {
                ...project,
                name: payload.name,
                code: payload.code,
                description: payload.description,
                accent: payload.accent,
                memberIds: payload.memberIds,
              }
            : project,
        ),
      );
      setStatusMessage(
        `Updated project "${payload.name}" (${payload.memberIds.length} assigned).`,
      );
      router.refresh();
    } else {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as {
        project?: AdminProject;
        error?: string;
      } | null;

      if (!response.ok || !data?.project) {
        return data?.error || "Failed to create project.";
      }

      setProjects((prev) => [data.project!, ...prev]);
      setActiveTab("projects");
      setStatusMessage(
        `Created project "${payload.name}" — now visible on the team dashboard for ${payload.memberIds.length} member(s).`,
      );
      router.refresh();
    }
  }

  async function handleDeleteProject(projectId: string) {
    const target = projects.find((p) => p.id === projectId);
    const response = await fetch(`/api/admin/projects/${projectId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Failed to remove project. Please try again.");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setConfirmDeleteProjectId(null);
    if (target) {
      setStatusMessage(`Removed project "${target.name}" from the workspace.`);
    }
    router.refresh();
  }

  async function handleAddAccount(payload: {
    name: string;
    email: string;
    role: AccountRole;
    password: string;
    projectIds: string[];
  }): Promise<string | void> {
    const response = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as {
      account?: AdminAccount;
      error?: string;
    } | null;

    if (!response.ok || !data?.account) {
      return data?.error || "Failed to create team account.";
    }

    const newAccount = data.account;
    setAccounts((prev) => [newAccount, ...prev]);

    if (payload.projectIds.length > 0) {
      setProjects((prev) =>
        prev.map((project) =>
          payload.projectIds.includes(project.id)
            ? {
                ...project,
                memberIds: Array.from(
                  new Set([...project.memberIds, newAccount.id]),
                ),
              }
            : project,
        ),
      );
    }

    setActiveTab("accounts");
    setStatusMessage(
      `Provisioned ${payload.role} account for ${newAccount.name} (${newAccount.email}).`,
    );
    router.refresh();
  }

  async function handleToggleAccountRole(accountId: string) {
    const target = accounts.find((a) => a.id === accountId);
    if (!target || target.isCurrentAdmin) return;

    const nextRole: AccountRole = target.role === "admin" ? "member" : "admin";
    const response = await fetch(`/api/admin/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });

    if (!response.ok) {
      setStatusMessage("Failed to update role. Please try again.");
      return;
    }

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId ? { ...account, role: nextRole } : account,
      ),
    );
    setStatusMessage(`Changed ${target.name}'s role to ${nextRole}.`);
    router.refresh();
  }

  async function handleDeleteAccount(accountId: string) {
    const target = accounts.find((a) => a.id === accountId);
    if (!target || target.isCurrentAdmin) return;

    const response = await fetch(`/api/admin/accounts/${accountId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Failed to remove account. Please try again.");
      return;
    }

    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        memberIds: project.memberIds.filter((id) => id !== accountId),
      })),
    );
    setConfirmDeleteAccountId(null);
    setStatusMessage(`Removed account for ${target.name} (${target.email}).`);
    router.refresh();
  }

  function getAssignedProjectCount(accountId: string): number {
    return projects.filter((p) => p.memberIds.includes(accountId)).length;
  }

  return (
    <div className="flex-1 w-full">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[2px] focus:border-2 focus:border-[var(--tb-ink)] focus:bg-[var(--tb-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--tb-on-accent)] focus:shadow-[var(--tb-shadow-sm)]"
      >
        Skip to admin workspace
      </a>

      <main
        id="admin-main"
        className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8"
      >
        {/* Workspace Title & Primary Actions */}
        <div className="flex flex-col gap-5 border-b-[3px] border-[var(--tb-ink)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[42px]">
              Admin Console
            </h1>
            <p className="mt-2 max-w-[54ch] text-[15px] font-medium leading-[1.5] text-[var(--tb-ink-muted)] sm:text-[16px]">
              Create project cards that appear on the client dashboard and provision
              accounts for your software team.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <BrutalButton
              type="button"
              variant="surface"
              onClick={openAddAccountModal}
              className="sm:w-auto sm:min-w-[168px]"
            >
              <UsersIcon className="h-4 w-4 shrink-0" />
              <span>ADD ACCOUNT</span>
            </BrutalButton>

            <BrutalButton
              type="button"
              variant="primary"
              onClick={openCreateProjectModal}
              className="sm:w-auto sm:min-w-[188px]"
            >
              <PlusIcon className="h-4 w-4 shrink-0" />
              <span>CREATE PROJECT</span>
            </BrutalButton>
          </div>
        </div>

        {/* Live Feedback Banner */}
        {statusMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 flex items-center justify-between gap-3 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-4 py-3 text-[14px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-sm)]"
          >
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              aria-label="Dismiss notification"
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Tabs & Search Toolbar */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div
            role="tablist"
            aria-label="Admin workspace sections"
            className="inline-flex w-full gap-2.5 sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              id="tab-projects"
              aria-selected={activeTab === "projects"}
              aria-controls="panel-projects"
              onClick={() => {
                setActiveTab("projects");
                setSearchQuery("");
              }}
              className={[
                "tb-tactile-motion inline-flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] px-4 text-[14px] font-bold text-[var(--tb-ink)] sm:flex-none",
                "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
                activeTab === "projects"
                  ? "bg-[var(--tb-ink)] text-[var(--tb-surface)] shadow-[var(--tb-shadow-sm)]"
                  : "bg-[var(--tb-surface)] hover:bg-[var(--tb-bg)] shadow-[var(--tb-shadow-xs)]",
              ].join(" ")}
            >
              <FolderBoardIcon className="h-4 w-4 shrink-0" />
              <span>Projects</span>
              <span
                className={[
                  "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                  activeTab === "projects"
                    ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]"
                    : "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
                ].join(" ")}
              >
                {projects.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-accounts"
              aria-selected={activeTab === "accounts"}
              aria-controls="panel-accounts"
              onClick={() => {
                setActiveTab("accounts");
                setSearchQuery("");
              }}
              className={[
                "tb-tactile-motion inline-flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] px-4 text-[14px] font-bold text-[var(--tb-ink)] sm:flex-none",
                "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
                activeTab === "accounts"
                  ? "bg-[var(--tb-ink)] text-[var(--tb-surface)] shadow-[var(--tb-shadow-sm)]"
                  : "bg-[var(--tb-surface)] hover:bg-[var(--tb-bg)] shadow-[var(--tb-shadow-xs)]",
              ].join(" ")}
            >
              <UsersIcon className="h-4 w-4 shrink-0" />
              <span>Team Accounts</span>
              <span
                className={[
                  "rounded-[2px] border border-[var(--tb-ink)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                  activeTab === "accounts"
                    ? "bg-[var(--tb-accent)] text-[var(--tb-on-accent)]"
                    : "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
                ].join(" ")}
              >
                {accounts.length}
              </span>
            </button>
          </div>

          <div className="relative w-full md:max-w-[340px]">
            <label htmlFor="admin-search" className="sr-only">
              {activeTab === "projects" ? "Search projects" : "Search team accounts"}
            </label>
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tb-ink)]" />
            <input
              id="admin-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={
                activeTab === "projects"
                  ? "Filter projects by name or key..."
                  : "Filter accounts by name or email..."
              }
              className="block min-h-[46px] w-full rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] py-2 pl-10 pr-3.5 text-[14px] font-medium text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] placeholder:text-[var(--tb-placeholder)] focus:bg-[var(--tb-surface-focus)] focus:shadow-[var(--tb-shadow-sm)] focus:outline-none focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
            />
          </div>
        </div>

        {/* TAB PANEL 1: PROJECTS (CLIENT DASHBOARD CARDS) */}
        {activeTab === "projects" ? (
          <section
            id="panel-projects"
            role="tabpanel"
            aria-labelledby="tab-projects"
            className="mt-6"
          >
            {filteredProjects.length === 0 ? (
              <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-8 text-center shadow-[var(--tb-shadow-md)]">
                <h2 className="text-[20px] font-bold text-[var(--tb-ink)]">
                  {projects.length === 0
                    ? "No projects created yet"
                    : "No matching projects"}
                </h2>
                <p className="mx-auto mt-1.5 max-w-[44ch] text-[14px] font-medium text-[var(--tb-ink-muted)]">
                  {projects.length === 0
                    ? "Create your first project card so assigned team members can open its 6-column Kanban board."
                    : `No project matched "${searchQuery}". Try a different keyword or clear the filter.`}
                </p>
                <div className="mt-5 flex justify-center">
                  {projects.length === 0 ? (
                    <BrutalButton
                      type="button"
                      variant="primary"
                      onClick={openCreateProjectModal}
                      className="w-auto min-w-[180px]"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>CREATE PROJECT</span>
                    </BrutalButton>
                  ) : (
                    <BrutalButton
                      type="button"
                      variant="surface"
                      onClick={() => setSearchQuery("")}
                      className="w-auto min-w-[140px]"
                    >
                      Clear filter
                    </BrutalButton>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => {
                  const assignedMembers = project.memberIds
                    .map((id) => accountById.get(id))
                    .filter((acc): acc is AdminAccount => Boolean(acc));
                  const totalTasks =
                    project.stages.backlog +
                    project.stages.todo +
                    project.stages.revision +
                    project.stages.inProgress +
                    project.stages.inReview +
                    project.stages.done;
                  const isConfirmingDelete = confirmDeleteProjectId === project.id;

                  return (
                    <article
                      key={project.id}
                      className="flex flex-col justify-between rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-md)]"
                    >
                      <div>
                        {/* Card top row: Code tag + Client visibility + Delete */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-0.5 text-[12px] font-bold tracking-[0.07em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
                                ACCENT_BG[project.accent],
                              ].join(" ")}
                            >
                              {project.code}
                            </span>
                            <span className="rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-2 py-0.5 text-[11px] font-bold tracking-[0.05em] text-[var(--tb-ink)]">
                              CLIENT CARD
                            </span>
                          </div>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(project.id)}
                                className="inline-flex min-h-[38px] cursor-pointer items-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-2.5 text-[12px] font-bold text-[var(--tb-on-accent)] hover:brightness-95 focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProjectId(null)}
                                className="inline-flex min-h-[38px] cursor-pointer items-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-2.5 text-[12px] font-bold text-[var(--tb-ink)] hover:bg-[var(--tb-bg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                              >
                                Keep
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteProjectId(project.id)}
                              aria-label={`Delete ${project.name}`}
                              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-transparent text-[var(--tb-ink)] hover:border-[var(--tb-ink)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <h2 className="mt-3.5 text-[21px] font-bold leading-snug tracking-[-0.02em] text-[var(--tb-ink)]">
                          {project.name}
                        </h2>
                        <p className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
                          {project.description}
                        </p>

                        {/* 6-Column Kanban Pipeline Snapshot */}
                        <div className="mt-4 border-t-2 border-[var(--tb-ink)] pt-3.5">
                          <div className="flex items-center justify-between text-[12px] font-bold text-[var(--tb-ink)]">
                            <span>KANBAN PIPELINE</span>
                            <span className="tabular-nums text-[var(--tb-ink-muted)]">
                              {project.stages.done}/{totalTasks} done
                            </span>
                          </div>

                          <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
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
                              <dt className="text-[11px] font-bold">
                                Revision
                              </dt>
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
                      </div>

                      {/* Card Footer: Assigned Members + Manage Action */}
                      <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-[var(--tb-ink)] pt-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {assignedMembers.slice(0, 4).map((member) => (
                              <span
                                key={member.id}
                                title={`${member.name} (${member.role})`}
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
                          <span className="truncate text-[13px] font-semibold text-[var(--tb-ink-muted)]">
                            {assignedMembers.length}{" "}
                            {assignedMembers.length === 1 ? "member" : "members"}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="tb-tactile-motion inline-flex min-h-[44px] items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-3.5 text-[13px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary-hover)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                          >
                            Open Board
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditProjectModal(project)}
                            className="tb-tactile-motion inline-flex min-h-[44px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3.5 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-bg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          /* TAB PANEL 2: TEAM ACCOUNTS DIRECTORY */
          <section
            id="panel-accounts"
            role="tabpanel"
            aria-labelledby="tab-accounts"
            className="mt-6"
          >
            <div className="overflow-hidden rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-md)]">
              {filteredAccounts.length === 0 ? (
                <div className="p-8 text-center">
                  <h2 className="text-[20px] font-bold text-[var(--tb-ink)]">
                    No matching accounts
                  </h2>
                  <p className="mt-1.5 text-[14px] font-medium text-[var(--tb-ink-muted)]">
                    No team member matched &ldquo;{searchQuery}&rdquo;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--tb-ink)]">
                          <th scope="col" className="px-5 py-3.5">
                            Team Member
                          </th>
                          <th scope="col" className="px-5 py-3.5">
                            Role
                          </th>
                          <th scope="col" className="px-5 py-3.5">
                            Assigned Projects
                          </th>
                          <th scope="col" className="px-5 py-3.5">
                            Added
                          </th>
                          <th scope="col" className="px-5 py-3.5 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[var(--tb-ink)]">
                        {filteredAccounts.map((account) => {
                          const assignedCount = getAssignedProjectCount(account.id);
                          const isConfirming = confirmDeleteAccountId === account.id;

                          return (
                            <tr key={account.id} className="hover:bg-[var(--tb-surface-focus)]">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={[
                                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] text-[13px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
                                      account.role === "admin"
                                        ? "bg-[var(--tb-secondary)]"
                                        : "bg-[var(--tb-accent)]",
                                    ].join(" ")}
                                  >
                                    {getInitials(account.name)}
                                  </span>
                                  <div>
                                    <p className="text-[15px] font-bold text-[var(--tb-ink)]">
                                      {account.name}
                                      {account.isCurrentAdmin ? (
                                        <span className="ml-2 rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--tb-on-accent)]">
                                          YOU
                                        </span>
                                      ) : null}
                                    </p>
                                    <p className="text-[13px] font-medium text-[var(--tb-ink-muted)]">
                                      {account.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={[
                                    "inline-flex rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-0.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
                                    account.role === "admin"
                                      ? "bg-[var(--tb-secondary)]"
                                      : "bg-[var(--tb-accent)]",
                                  ].join(" ")}
                                >
                                  {account.role}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-[14px] font-bold tabular-nums text-[var(--tb-ink)]">
                                {assignedCount}{" "}
                                <span className="font-medium text-[var(--tb-ink-muted)]">
                                  {assignedCount === 1 ? "project" : "projects"}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-[14px] font-medium text-[var(--tb-ink-muted)]">
                                {account.createdAt}
                              </td>

                              <td className="px-5 py-4 text-right">
                                {account.isCurrentAdmin ? (
                                  <span className="text-[13px] font-semibold text-[var(--tb-ink-muted)]">
                                    Primary owner
                                  </span>
                                ) : isConfirming ? (
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAccount(account.id)}
                                      className="inline-flex min-h-[40px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3 text-[13px] font-bold text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                                    >
                                      Confirm remove
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteAccountId(null)}
                                      className="inline-flex min-h-[40px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[13px] font-bold text-[var(--tb-ink)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleAccountRole(account.id)}
                                      className="tb-tactile-motion inline-flex min-h-[44px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-bg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                                    >
                                      {account.role === "admin"
                                        ? "Set Member"
                                        : "Set Admin"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteAccountId(account.id)}
                                      aria-label={`Remove ${account.name}`}
                                      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked Account List */}
                  <ul className="divide-y-2 divide-[var(--tb-ink)] md:hidden">
                    {filteredAccounts.map((account) => {
                      const assignedCount = getAssignedProjectCount(account.id);
                      const isConfirming = confirmDeleteAccountId === account.id;

                      return (
                        <li key={account.id} className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={[
                                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] text-[13px] font-bold text-[var(--tb-on-accent)]",
                                  account.role === "admin"
                                    ? "bg-[var(--tb-secondary)]"
                                    : "bg-[var(--tb-accent)]",
                                ].join(" ")}
                              >
                                {getInitials(account.name)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-bold text-[var(--tb-ink)]">
                                  {account.name}
                                </p>
                                <p className="truncate text-[13px] font-medium text-[var(--tb-ink-muted)]">
                                  {account.email}
                                </p>
                              </div>
                            </div>

                            <span
                              className={[
                                "shrink-0 rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--tb-on-accent)]",
                                account.role === "admin"
                                  ? "bg-[var(--tb-secondary)]"
                                  : "bg-[var(--tb-accent)]",
                              ].join(" ")}
                            >
                              {account.role}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] font-medium text-[var(--tb-ink-muted)]">
                            <span>
                              {assignedCount}{" "}
                              {assignedCount === 1 ? "project" : "projects"} assigned
                            </span>
                            <span>Added {account.createdAt}</span>
                          </div>

                          {!account.isCurrentAdmin ? (
                            <div className="flex items-center gap-2 pt-1">
                              {isConfirming ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccount(account.id)}
                                    className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-secondary)] px-3 text-[13px] font-bold text-[var(--tb-on-accent)]"
                                  >
                                    Confirm remove
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteAccountId(null)}
                                    className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[13px] font-bold text-[var(--tb-ink)]"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAccountRole(account.id)}
                                    className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]"
                                  >
                                    {account.role === "admin"
                                      ? "Set Member"
                                      : "Set Admin"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteAccountId(account.id)}
                                    aria-label={`Remove ${account.name}`}
                                    className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)]"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      {isProjectModalOpen ? (
        <ProjectModal
          key={editingProject?.id ?? "create-project"}
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          accounts={accounts}
          editingProject={editingProject}
          onSaveProject={handleSaveProject}
        />
      ) : null}

      {isAccountModalOpen ? (
        <AccountModal
          key={`add-account-${accountModalVersion}`}
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          existingEmails={accounts.map((a) => a.email.toLowerCase())}
          projects={projects}
          onAddAccount={handleAddAccount}
        />
      ) : null}
    </div>
  );
}
