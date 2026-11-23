"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, SearchIcon, UsersIcon } from "@/components/admin/admin-icons";
import { getInitials } from "@/components/admin/types";
import type { KanbanMember } from "./types";

export type MemberFilterValue = "ALL" | "UNASSIGNED" | string;

interface MemberFilterDropdownProps {
  members: KanbanMember[];
  selectedMemberId: MemberFilterValue;
  onSelectMember: (memberId: MemberFilterValue) => void;
  taskCounts: {
    total: number;
    unassigned: number;
    byMember: Map<string, number>;
  };
  currentUserId: string;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 7.5L10 12.5L15 7.5" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.5 10.5L8.2 14.2L15.5 6" />
    </svg>
  );
}

export function MemberFilterDropdown({
  members,
  selectedMemberId,
  onSelectMember,
  taskCounts,
  currentUserId,
}: MemberFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedMember = useMemo(
    () =>
      selectedMemberId !== "ALL" && selectedMemberId !== "UNASSIGNED"
        ? members.find((m) => m.id === selectedMemberId) ?? null
        : null,
    [members, selectedMemberId],
  );

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(value: MemberFilterValue) {
    onSelectMember(value);
    setIsOpen(false);
    setSearchQuery("");
  }

  const isFiltered = selectedMemberId !== "ALL";

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (prev) setSearchQuery("");
            return !prev;
          });
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filter task berdasarkan member"
        className={[
          "tb-tactile-motion inline-flex min-h-[36px] max-w-[240px] cursor-pointer items-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] px-2.5 py-1 text-[12px] font-bold shadow-[var(--tb-shadow-xs)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
          isFiltered
            ? "bg-[var(--tb-amber)] text-[var(--tb-on-accent)]"
            : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
        ].join(" ")}
      >
        {selectedMember ? (
          <>
            <span
              className={[
                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] text-[9px] font-bold text-[var(--tb-on-accent)]",
                selectedMember.role === "admin"
                  ? "bg-[var(--tb-secondary)]"
                  : "bg-[var(--tb-accent)]",
              ].join(" ")}
            >
              {getInitials(selectedMember.name)}
            </span>
            <span className="truncate">{selectedMember.name}</span>
          </>
        ) : selectedMemberId === "UNASSIGNED" ? (
          <>
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-dashed border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[10px] font-bold text-[var(--tb-ink)]">
              –
            </span>
            <span className="truncate">Unassigned</span>
          </>
        ) : (
          <>
            <UsersIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">Semua Member</span>
          </>
        )}

        <ChevronDownIcon
          className={[
            "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isFiltered ? (
        <button
          type="button"
          onClick={() => handleSelect("ALL")}
          aria-label="Reset filter member"
          title="Reset filter member"
          className="tb-tactile-motion inline-flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] hover:text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Pilih member untuk filter task"
          className="absolute left-0 top-full z-40 mt-1.5 w-[272px] rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-md)] sm:left-auto sm:right-0 sm:w-[292px]"
        >
          <div className="border-b-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--tb-ink)]">
              Filter by Member
            </p>
          </div>

          {members.length > 6 ? (
            <div className="border-b-2 border-[var(--tb-ink)]/20 p-2">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--tb-placeholder)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari member..."
                  aria-label="Cari member"
                  autoFocus
                  className="w-full rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] py-1.5 pl-8 pr-2.5 text-[12px] font-medium text-[var(--tb-ink)] placeholder:text-[var(--tb-placeholder)] focus:bg-[var(--tb-surface-focus)] focus:outline-none"
                />
              </div>
            </div>
          ) : null}

          <div className="max-h-[300px] overflow-y-auto p-1.5">
            {/* Option: Semua Member */}
            <button
              type="button"
              role="option"
              aria-selected={selectedMemberId === "ALL"}
              onClick={() => handleSelect("ALL")}
              className={[
                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[3px] border-2 px-2.5 py-2 text-left transition-colors",
                selectedMemberId === "ALL"
                  ? "border-[var(--tb-ink)] bg-[var(--tb-amber)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                  : "border-transparent text-[var(--tb-ink)] hover:border-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[var(--tb-ink)]">
                  <UsersIcon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-[13px] font-bold">
                  Semua Member
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--tb-ink)]">
                  {taskCounts.total}
                </span>
                {selectedMemberId === "ALL" ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)]">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                ) : null}
              </span>
            </button>

            <div className="my-1.5 border-t-2 border-[var(--tb-ink)]/15" />

            {/* Member List */}
            {filteredMembers.length === 0 ? (
              <p className="px-2.5 py-3 text-center text-[12px] font-medium text-[var(--tb-ink-muted)]">
                Member tidak ditemukan.
              </p>
            ) : (
              <div className="space-y-1">
                {filteredMembers.map((member) => {
                  const isSelected = selectedMemberId === member.id;
                  const count = taskCounts.byMember.get(member.id) ?? 0;
                  const isMe = member.id === currentUserId;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(member.id)}
                      className={[
                        "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[3px] border-2 px-2.5 py-1.5 text-left transition-colors",
                        isSelected
                          ? "border-[var(--tb-ink)] bg-[var(--tb-amber)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                          : "border-transparent text-[var(--tb-ink)] hover:border-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                      ].join(" ")}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={[
                            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] text-[10px] font-bold text-[var(--tb-on-accent)]",
                            member.role === "admin"
                              ? "bg-[var(--tb-secondary)]"
                              : "bg-[var(--tb-accent)]",
                          ].join(" ")}
                        >
                          {getInitials(member.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[13px] font-bold">
                              {member.name}
                            </span>
                            {isMe ? (
                              <span className="shrink-0 rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1 text-[9px] font-bold uppercase text-[var(--tb-ink)]">
                                Saya
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={[
                              "block truncate text-[11px] font-medium",
                              isSelected
                                ? "text-[var(--tb-on-accent)]/80"
                                : "text-[var(--tb-ink-muted)]",
                            ].join(" ")}
                          >
                            {member.email}
                          </span>
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-1.5">
                        <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--tb-ink)]">
                          {count}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)]">
                            <CheckIcon className="h-3 w-3" />
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="my-1.5 border-t-2 border-[var(--tb-ink)]/15" />

            {/* Option: Unassigned */}
            <button
              type="button"
              role="option"
              aria-selected={selectedMemberId === "UNASSIGNED"}
              onClick={() => handleSelect("UNASSIGNED")}
              className={[
                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[3px] border-2 px-2.5 py-2 text-left transition-colors",
                selectedMemberId === "UNASSIGNED"
                  ? "border-[var(--tb-ink)] bg-[var(--tb-amber)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                  : "border-transparent text-[var(--tb-ink)] hover:border-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border-2 border-dashed border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[12px] font-bold text-[var(--tb-ink-muted)]">
                  –
                </span>
                <span className="truncate text-[13px] font-bold">
                  Unassigned
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--tb-ink)]">
                  {taskCounts.unassigned}
                </span>
                {selectedMemberId === "UNASSIGNED" ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)]">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                ) : null}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
