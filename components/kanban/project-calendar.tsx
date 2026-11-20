"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "@/components/admin/admin-icons";
import { getInitials } from "@/components/admin/types";
import {
  KANBAN_COLUMNS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type KanbanTask,
  type TaskPriority,
  type TaskStatus,
} from "./types";

interface ProjectCalendarProps {
  tasks: KanbanTask[];
  onSelectTask: (task: KanbanTask) => void;
  onCreateTaskForDate: (dateIso: string) => void;
}

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const STATUS_CHIP_STYLE: Record<TaskStatus, string> = {
  BACKLOG: "bg-[var(--tb-bg)] text-[var(--tb-ink)]",
  TODO: "bg-[var(--tb-surface)] text-[var(--tb-ink)]",
  REVISION: "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)]",
  IN_PROGRESS: "bg-[var(--tb-accent)] text-[var(--tb-on-accent)]",
  IN_REVIEW: "bg-[var(--tb-amber)] text-[var(--tb-on-accent)]",
  DONE: "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]",
};

const PRIORITY_DOT_STYLE: Record<TaskPriority, string> = {
  LOW: "bg-[var(--tb-bg)]",
  MEDIUM: "bg-[var(--tb-amber)]",
  HIGH: "bg-[var(--tb-secondary)]",
  URGENT: "bg-[var(--tb-urgent-bg)]",
};

function toDateIso(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getTodayIso(): string {
  const now = new Date();
  return toDateIso(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatMonthTitle(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

interface CalendarCell {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
}

function buildMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const prevMonthDate = new Date(year, monthIndex - 1, daysInPrevMonth - i);
    cells.push({
      iso: toDateIso(
        prevMonthDate.getFullYear(),
        prevMonthDate.getMonth(),
        prevMonthDate.getDate(),
      ),
      day: prevMonthDate.getDate(),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      iso: toDateIso(year, monthIndex, day),
      day,
      inCurrentMonth: true,
    });
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day += 1) {
    const nextMonthDate = new Date(year, monthIndex + 1, day);
    cells.push({
      iso: toDateIso(
        nextMonthDate.getFullYear(),
        nextMonthDate.getMonth(),
        nextMonthDate.getDate(),
      ),
      day: nextMonthDate.getDate(),
      inCurrentMonth: false,
    });
  }

  return cells;
}

export function ProjectCalendar({
  tasks,
  onSelectTask,
  onCreateTaskForDate,
}: ProjectCalendarProps) {
  const todayIso = getTodayIso();
  const initialNow = new Date();
  const [viewYear, setViewYear] = useState(initialNow.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialNow.getMonth());
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");

  const filteredTasks = useMemo(() => {
    if (statusFilter === "ALL") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const { tasksByDate, unscheduledTasks } = useMemo(() => {
    const map = new Map<string, KanbanTask[]>();
    const unscheduled: KanbanTask[] = [];

    for (const task of filteredTasks) {
      if (!task.startDate && !task.dueDate) {
        unscheduled.push(task);
        continue;
      }

      const start = task.startDate || task.dueDate;
      const end = task.dueDate || task.startDate;

      for (const cell of cells) {
        if (cell.iso >= start && cell.iso <= end) {
          const list = map.get(cell.iso) ?? [];
          list.push(task);
          map.set(cell.iso, list);
        }
      }
    }

    return { tasksByDate: map, unscheduledTasks: unscheduled };
  }, [filteredTasks, cells]);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleToday() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }

  return (
    <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-5 sm:px-6">
      {/* Calendar Toolbar */}
      <div className="flex flex-col gap-3 rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4 shadow-[var(--tb-shadow-sm)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan sebelumnya"
              className="tb-tactile-motion inline-flex min-h-[38px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="tb-tactile-motion inline-flex min-h-[38px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan berikutnya"
              className="tb-tactile-motion inline-flex min-h-[38px] cursor-pointer items-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)]"
            >
              →
            </button>
          </div>

          <h2 className="text-[20px] font-bold capitalize tracking-[-0.02em] text-[var(--tb-ink)] sm:text-[22px]">
            {formatMonthTitle(viewYear, viewMonth)}
          </h2>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={[
              "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-1 text-[11px] font-bold uppercase",
              statusFilter === "ALL"
                ? "bg-[var(--tb-ink)] text-[var(--tb-surface)] shadow-[var(--tb-shadow-xs)]"
                : "bg-[var(--tb-bg)] text-[var(--tb-ink)] hover:bg-[var(--tb-surface)]",
            ].join(" ")}
          >
            Semua ({tasks.length})
          </button>
          {KANBAN_COLUMNS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setStatusFilter(col.id)}
              className={[
                "cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2.5 py-1 text-[11px] font-bold uppercase",
                statusFilter === col.id
                  ? `${col.headerBg} ${col.headerInk} shadow-[var(--tb-shadow-xs)]`
                  : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
              ].join(" ")}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mt-4 overflow-x-auto rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-md)]">
        <div className="min-w-[840px]">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b-[3px] border-[var(--tb-ink)] bg-[var(--tb-bg)]">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="border-r-2 border-[var(--tb-ink)] px-3 py-2 text-center text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tb-ink)] last:border-r-0"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const cellTasks = tasksByDate.get(cell.iso) ?? [];
              const isToday = cell.iso === todayIso;
              const isLastInRow = (index + 1) % 7 === 0;

              return (
                <div
                  key={cell.iso}
                  className={[
                    "group flex min-h-[136px] flex-col border-b-2 border-[var(--tb-ink)] p-2",
                    isLastInRow ? "" : "border-r-2",
                    cell.inCurrentMonth
                      ? "bg-[var(--tb-surface)]"
                      : "bg-[var(--tb-bg)]/60 opacity-70",
                    isToday ? "ring-3 ring-inset ring-[var(--tb-primary)]" : "",
                  ].join(" ")}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <span
                      className={[
                        "inline-flex h-6 min-w-[24px] items-center justify-center rounded-[2px] px-1.5 text-[12px] font-bold tabular-nums",
                        isToday
                          ? "border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]"
                          : "text-[var(--tb-ink)]",
                      ].join(" ")}
                    >
                      {cell.day}
                    </span>

                    <button
                      type="button"
                      onClick={() => onCreateTaskForDate(cell.iso)}
                      aria-label={`Buat task untuk tanggal ${cell.iso}`}
                      title={`Buat task (Due ${cell.iso})`}
                      className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] opacity-0 transition-opacity hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)] group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {cellTasks.map((task) => {
                      const isOverdue = Boolean(
                        task.dueDate &&
                          task.dueDate < todayIso &&
                          task.status !== "DONE",
                      );
                      const isDueDay = task.dueDate === cell.iso;
                      const isStartDay =
                        task.startDate === cell.iso &&
                        task.dueDate &&
                        task.startDate !== task.dueDate;

                      return (
                        <button
                          key={`${cell.iso}-${task.id}`}
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className={[
                            "tb-tactile-motion block w-full cursor-pointer rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-1 text-left shadow-[var(--tb-shadow-xs)] hover:-translate-x-0.5 hover:-translate-y-0.5",
                            STATUS_CHIP_STYLE[task.status],
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="flex min-w-0 items-center gap-1">
                              <span
                                className={[
                                  "inline-block h-2 w-2 shrink-0 rounded-full border border-[var(--tb-ink)]",
                                  PRIORITY_DOT_STYLE[task.priority],
                                ].join(" ")}
                                title={`Priority: ${TASK_PRIORITY_LABELS[task.priority]}`}
                              />
                              <span className="truncate text-[11px] font-bold leading-tight">
                                {task.title}
                              </span>
                            </span>
                            {isOverdue && isDueDay ? (
                              <span className="shrink-0 rounded-[2px] bg-[var(--tb-urgent-bg)] px-1 text-[9px] font-bold text-[var(--tb-urgent-ink)]">
                                LATE
                              </span>
                            ) : isStartDay ? (
                              <span className="shrink-0 text-[9px] font-bold uppercase opacity-80">
                                START
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-0.5 flex items-center justify-between gap-1 text-[10px] font-semibold opacity-85">
                            <span className="truncate">
                              {TASK_STATUS_LABELS[task.status]}
                            </span>
                            {task.assignee ? (
                              <span className="shrink-0 font-bold">
                                {getInitials(task.assignee.name)}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unscheduled Tasks Section */}
      <section className="mt-6 rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-4 shadow-[var(--tb-shadow-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[var(--tb-ink)] pb-3">
          <div>
            <h3 className="text-[16px] font-bold text-[var(--tb-ink)]">
              Task Belum Dijadwalkan ({unscheduledTasks.length})
            </h3>
            <p className="text-[12px] font-medium text-[var(--tb-ink-muted)]">
              Klik task di bawah untuk menambahkan Start Date atau Due Date agar tampil di kalender.
            </p>
          </div>
        </div>

        {unscheduledTasks.length === 0 ? (
          <p className="mt-3 text-[13px] font-medium text-[var(--tb-ink-muted)]">
            Semua task pada filter ini sudah memiliki jadwal tanggal.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {unscheduledTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelectTask(task)}
                className="tb-tactile-motion flex cursor-pointer items-center justify-between gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3 py-2.5 text-left shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-surface)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[var(--tb-ink)]">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[var(--tb-ink-muted)]">
                    {TASK_STATUS_LABELS[task.status]} •{" "}
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </p>
                </div>
                <span className="shrink-0 rounded-[2px] border border-[var(--tb-ink)] bg-[var(--tb-surface)] px-2 py-0.5 text-[11px] font-bold text-[var(--tb-ink)]">
                  Atur Tanggal
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
