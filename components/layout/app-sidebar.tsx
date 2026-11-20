"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  CloseIcon,
  FolderBoardIcon,
  LogOutIcon,
  UsersIcon,
} from "@/components/admin/admin-icons";
import { getInitials, type ProjectAccent } from "@/components/admin/types";
import { TechBroMark } from "@/components/login/icons";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export interface SidebarUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface SidebarProject {
  id: string;
  code: string;
  name: string;
  accent: ProjectAccent;
}

interface AppSidebarProps {
  currentUser: SidebarUser;
  projects: SidebarProject[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const ACCENT_BG: Record<ProjectAccent, string> = {
  lime: "bg-[var(--tb-primary)]",
  coral: "bg-[var(--tb-secondary)]",
  violet: "bg-[var(--tb-accent)]",
};

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="2.5" width="6" height="6" />
      <rect x="11.5" y="2.5" width="6" height="6" />
      <rect x="2.5" y="11.5" width="6" height="6" />
      <rect x="11.5" y="11.5" width="6" height="6" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2V4.2M10 15.8V18M2 10H4.2M15.8 10H18M4.3 4.3L5.9 5.9M14.1 14.1L15.7 15.7M15.7 4.3L14.1 5.9M5.9 14.1L4.3 15.7" />
    </svg>
  );
}

function SidebarToggleIcon({
  collapsed,
  className,
}: {
  collapsed: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="3" width="15" height="14" />
      <path d="M7.5 3V17" />
      {collapsed ? (
        <path d="M11 8L13.5 10L11 12" />
      ) : (
        <path d="M13.5 8L11 10L13.5 12" />
      )}
    </svg>
  );
}

export function AppSidebar({
  currentUser,
  projects,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isDashboardActive = pathname === "/dashboard";
  const isProjectsIndexActive = pathname === "/projects";
  const isSettingsActive = pathname.startsWith("/settings");
  const isAdminActive = pathname.startsWith("/admin");

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  function renderNavContent(isCompact: boolean) {
    return (
      <div className="flex h-full flex-col bg-[var(--tb-surface)]">
        {/* Brand Header */}
        <div
          className={[
            "flex items-center border-b-[3px] border-[var(--tb-ink)] px-3 py-3.5",
            isCompact ? "justify-center" : "justify-between gap-2 px-4",
          ].join(" ")}
        >
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex min-w-0 items-center gap-2.5 focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
          >
            <span className="inline-flex shrink-0 shadow-[var(--tb-shadow-xs)]">
              <TechBroMark className="h-9 w-9" />
            </span>
            {!isCompact ? (
              <div className="min-w-0">
                <span className="block truncate text-[17px] font-bold leading-none tracking-[0.06em] text-[var(--tb-ink)]">
                  TECH BRO
                </span>
                <span className="mt-1 inline-block rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-accent)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-[var(--tb-on-accent)]">
                  WORKSPACE
                </span>
              </div>
            ) : null}
          </Link>

          {/* Desktop collapse toggle (shown in header when expanded) */}
          {!mobileOpen && !isCompact ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)] lg:inline-flex"
            >
              <SidebarToggleIcon collapsed={false} className="h-4 w-4" />
            </button>
          ) : null}

          {mobileOpen ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] lg:hidden"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Collapse button when compact on desktop */}
        {isCompact && !mobileOpen ? (
          <div className="hidden justify-center border-b-2 border-[var(--tb-ink)] py-2 lg:flex">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              <SidebarToggleIcon collapsed={true} className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Main Navigation */}
        <nav
          aria-label="Workspace navigation"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          {!isCompact ? (
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--tb-ink-muted)]">
              Menu Utama
            </p>
          ) : null}

          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                onClick={onCloseMobile}
                title="Dashboard"
                className={[
                  "tb-tactile-motion flex min-h-[44px] items-center gap-3 rounded-[3px] border-2 border-[var(--tb-ink)] px-3 text-[13px] font-bold transition-colors",
                  isCompact ? "justify-center px-0" : "",
                  isDashboardActive
                    ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                    : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                ].join(" ")}
              >
                <DashboardIcon className="h-4 w-4 shrink-0" />
                {!isCompact ? <span>Dashboard</span> : null}
              </Link>
            </li>

            <li>
              <Link
                href="/projects"
                onClick={onCloseMobile}
                title="Projects"
                className={[
                  "tb-tactile-motion flex min-h-[44px] items-center justify-between gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] px-3 text-[13px] font-bold transition-colors",
                  isCompact ? "justify-center px-0" : "",
                  isProjectsIndexActive
                    ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                    : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-3">
                  <FolderBoardIcon className="h-4 w-4 shrink-0" />
                  {!isCompact ? <span>Projects</span> : null}
                </span>
                {!isCompact ? (
                  <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--tb-ink)]">
                    {projects.length}
                  </span>
                ) : null}
              </Link>
            </li>

            <li>
              <Link
                href="/settings"
                onClick={onCloseMobile}
                title="Settings"
                className={[
                  "tb-tactile-motion flex min-h-[44px] items-center gap-3 rounded-[3px] border-2 border-[var(--tb-ink)] px-3 text-[13px] font-bold transition-colors",
                  isCompact ? "justify-center px-0" : "",
                  isSettingsActive
                    ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                    : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                ].join(" ")}
              >
                <SettingsIcon className="h-4 w-4 shrink-0" />
                {!isCompact ? <span>Settings</span> : null}
              </Link>
            </li>

            {currentUser.role === "admin" ? (
              <li>
                <Link
                  href="/admin"
                  onClick={onCloseMobile}
                  title="Admin Console"
                  className={[
                    "tb-tactile-motion flex min-h-[44px] items-center gap-3 rounded-[3px] border-2 border-[var(--tb-ink)] px-3 text-[13px] font-bold transition-colors",
                    isCompact ? "justify-center px-0" : "",
                    isAdminActive
                      ? "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                      : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                  ].join(" ")}
                >
                  <UsersIcon className="h-4 w-4 shrink-0" />
                  {!isCompact ? <span>Admin Console</span> : null}
                </Link>
              </li>
            ) : null}
          </ul>

          {/* Quick Project Switcher */}
          {projects.length > 0 ? (
            <div className="mt-6 border-t-2 border-[var(--tb-ink)] pt-4">
              {!isCompact ? (
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--tb-ink-muted)]">
                  Project Kamu
                </p>
              ) : null}
              <ul className="space-y-1.5">
                {projects.map((project) => {
                  const isCurrentProject = pathname === `/projects/${project.id}`;
                  return (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={onCloseMobile}
                        title={`${project.code} — ${project.name}`}
                        className={[
                          "flex min-h-[38px] items-center gap-2.5 rounded-[3px] border-2 px-2 py-1.5 text-[12px] font-bold transition-colors",
                          isCompact ? "justify-center px-0" : "",
                          isCurrentProject
                            ? "border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]"
                            : "border-transparent text-[var(--tb-ink-muted)] hover:border-[var(--tb-ink)] hover:bg-[var(--tb-bg)] hover:text-[var(--tb-ink)]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "inline-flex h-6 min-w-[28px] shrink-0 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] px-1 text-[9px] font-bold uppercase tracking-[0.04em] text-[var(--tb-on-accent)]",
                            ACCENT_BG[project.accent],
                          ].join(" ")}
                        >
                          {project.code.slice(0, 4)}
                        </span>
                        {!isCompact ? (
                          <span className="truncate">{project.name}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </nav>

        {/* Sidebar Footer: Dark Mode + Profile + Sign Out */}
        <div className="space-y-2.5 border-t-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)] p-3">
          <div className={isCompact ? "flex justify-center" : ""}>
            <ThemeToggle fullWidth={!isCompact} compact={isCompact} />
          </div>

          <Link
            href="/settings"
            onClick={onCloseMobile}
            title={`${currentUser.name} (${currentUser.email})`}
            className={[
              "flex items-center gap-2.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] p-2 hover:bg-[var(--tb-primary)]/20",
              isCompact ? "justify-center p-1.5" : "",
            ].join(" ")}
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[11px] font-bold text-[var(--tb-on-accent)]">
              {getInitials(currentUser.name)}
            </span>
            {!isCompact ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold leading-tight text-[var(--tb-ink)]">
                  {currentUser.name}
                </p>
                <p className="truncate text-[11px] font-medium text-[var(--tb-ink-muted)]">
                  {currentUser.role === "admin" ? "Admin" : "Member"}
                </p>
              </div>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            title="Sign out"
            className={[
              "tb-tactile-motion flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] disabled:cursor-not-allowed disabled:opacity-60",
              isCompact ? "px-0" : "",
            ].join(" ")}
          >
            <LogOutIcon className="h-4 w-4 shrink-0" />
            {!isCompact ? (
              <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
            ) : null}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={[
          "sticky top-0 hidden h-dvh shrink-0 border-r-[3px] border-[var(--tb-ink)] transition-[width] duration-150 lg:block",
          collapsed ? "w-[78px]" : "w-[264px]",
        ].join(" ")}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={onCloseMobile}
            aria-hidden="true"
            className="fixed inset-0 bg-[var(--tb-overlay)]"
          />
          <aside className="relative z-10 h-dvh w-[280px] max-w-[85vw] border-r-[3px] border-[var(--tb-ink)] shadow-[var(--tb-shadow-lg)]">
            {renderNavContent(false)}
          </aside>
        </div>
      ) : null}
    </>
  );
}
