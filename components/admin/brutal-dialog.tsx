"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "./admin-icons";

interface BrutalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}

export function BrutalDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
}: BrutalDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/55 p-4 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brutal-dialog-title"
        aria-describedby="brutal-dialog-description"
        className="max-h-[90dvh] w-full max-w-[540px] overflow-y-auto rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-lg)] sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b-2 border-[var(--tb-ink)] pb-4">
          <div>
            <h2
              id="brutal-dialog-title"
              className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[var(--tb-ink)] sm:text-[25px]"
            >
              {title}
            </h2>
            <p
              id="brutal-dialog-description"
              className="mt-1 text-[14px] font-medium leading-snug text-[var(--tb-ink-muted)]"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="tb-tactile-motion inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-secondary)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
