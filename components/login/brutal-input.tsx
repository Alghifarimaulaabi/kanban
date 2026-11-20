"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertIcon } from "./icons";

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  rightSlot?: ReactNode;
}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  function BrutalInput({ id, label, error, rightSlot, className = "", ...props }, ref) {
    const errorId = `${id}-error`;

    return (
      <div className="space-y-1.5 sm:space-y-2">
        <label
          htmlFor={id}
          className="block text-[14px] font-bold tracking-[0.01em] text-[var(--tb-ink)]"
        >
          {label}
        </label>

        <div className="relative flex items-stretch">
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={[
              "tb-tactile-motion block min-h-[46px] w-full rounded-[3px] border-2 px-3.5 py-2 sm:min-h-[48px] sm:py-2.5",
              "bg-[var(--tb-surface)] text-[15px] font-medium text-[var(--tb-ink)]",
              "placeholder:text-[var(--tb-placeholder)]",
              "transition-[box-shadow,background-color,border-color] duration-150 ease-out",
              "focus:bg-[var(--tb-surface-focus)] focus:shadow-[var(--tb-shadow-sm)] focus:outline-none",
              "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
              "disabled:cursor-not-allowed disabled:bg-[var(--tb-bg)] disabled:opacity-70",
              error
                ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] shadow-[var(--tb-shadow-error)] focus:shadow-[var(--tb-shadow-error)]"
                : "border-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]",
              rightSlot ? "pr-14" : "",
              className,
            ].join(" ")}
            {...props}
          />

          {rightSlot ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              {rightSlot}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-[13px] font-semibold leading-snug text-[var(--tb-error)]"
          >
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  },
);
