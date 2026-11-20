"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { TechBroMark } from "@/components/login/icons";
import {
  AppSidebar,
  type SidebarProject,
  type SidebarUser,
} from "./app-sidebar";

interface WorkspaceShellProps {
  currentUser: SidebarUser;
  projects: SidebarProject[];
  children: ReactNode;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" />
    </svg>
  );
}

export function WorkspaceShell({
  currentUser,
  projects,
  children,
}: WorkspaceShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="tb-brutal-surface tb-grid-bg flex min-h-dvh w-full overflow-x-clip">
      <AppSidebar
        currentUser={currentUser}
        projects={projects}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] px-4 py-2.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[16px] font-bold tracking-[0.06em] text-[var(--tb-ink)]"
          >
            <TechBroMark className="h-7 w-7" />
            <span>TECH BRO</span>
          </Link>

          <div className="w-10" aria-hidden="true" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
