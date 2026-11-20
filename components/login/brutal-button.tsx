"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type BrutalButtonVariant = "primary" | "surface" | "secondary" | "accent";

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrutalButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BrutalButtonVariant, string> = {
  primary:
    "bg-[var(--tb-primary)] text-[var(--tb-on-accent)] hover:bg-[var(--tb-primary-hover)]",
  surface:
    "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
  secondary:
    "bg-[var(--tb-secondary)] text-[var(--tb-on-accent)] hover:brightness-95",
  accent:
    "bg-[var(--tb-accent)] text-[var(--tb-on-accent)] hover:brightness-95",
};

export function BrutalButton({
  variant = "primary",
  isLoading = false,
  loadingLabel = "LOADING...",
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: BrutalButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={[
        "tb-tactile-motion relative inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 sm:min-h-[50px]",
        "rounded-[3px] border-2 border-[var(--tb-ink)] px-5 py-2.5 sm:py-3",
        "text-[15px] font-bold tracking-[0.04em]",
        "transition-[transform,box-shadow,background-color] duration-150 ease-out",
        "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--tb-ink)]",
        VARIANT_CLASSES[variant],
        isDisabled
          ? "cursor-not-allowed opacity-75 shadow-[var(--tb-shadow-xs)] translate-x-[2px] translate-y-[2px]"
          : "cursor-pointer shadow-[var(--tb-shadow-sm)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--tb-shadow-md)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[var(--tb-shadow-pressed)]",
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1" aria-hidden="true">
            <span className="tb-loading-dot h-2 w-2 bg-current" />
            <span className="tb-loading-dot-2 h-2 w-2 bg-current" />
            <span className="tb-loading-dot-3 h-2 w-2 bg-current" />
          </span>
          <span>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
