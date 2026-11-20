"use client";

import { useState, type FormEvent } from "react";
import { BrutalButton } from "@/components/login/brutal-button";
import { BrutalInput } from "@/components/login/brutal-input";
import { AlertIcon, CheckIcon } from "@/components/login/icons";
import { BrutalDialog } from "./brutal-dialog";
import {
  getInitials,
  type AdminAccount,
  type AdminProject,
  type ProjectAccent,
} from "./types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AdminAccount[];
  editingProject?: AdminProject | null;
  onSaveProject: (payload: {
    id?: string;
    name: string;
    code: string;
    description: string;
    accent: ProjectAccent;
    memberIds: string[];
  }) => void;
}

const ACCENT_OPTIONS: { value: ProjectAccent; label: string; bg: string }[] = [
  { value: "lime", label: "Acid Lime", bg: "bg-[var(--tb-primary)]" },
  { value: "violet", label: "Electric Violet", bg: "bg-[var(--tb-accent)]" },
  { value: "coral", label: "Signal Coral", bg: "bg-[var(--tb-secondary)]" },
];

export function ProjectModal({
  isOpen,
  onClose,
  accounts,
  editingProject,
  onSaveProject,
}: ProjectModalProps) {
  const [name, setName] = useState(editingProject?.name ?? "");
  const [code, setCode] = useState(editingProject?.code ?? "");
  const [description, setDescription] = useState(
    editingProject?.description ?? "",
  );
  const [accent, setAccent] = useState<ProjectAccent>(
    editingProject?.accent ?? "lime",
  );
  const [memberIds, setMemberIds] = useState<string[]>(
    editingProject?.memberIds ?? accounts.filter((a) => a.role === "admin").map((a) => a.id),
  );
  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    members?: string;
  }>({});

  function deriveCode(projectName: string) {
    const cleaned = projectName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "");
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";
    if (words.length === 1) return words[0].slice(0, 4);
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 5);
  }

  function toggleMember(accountId: string) {
    setMemberIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    );
    if (errors.members) {
      setErrors((prev) => ({ ...prev, members: undefined }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const resolvedCode = (code.trim() || deriveCode(trimmedName)).toUpperCase();
    const trimmedDesc = description.trim();
    const nextErrors: typeof errors = {};

    if (!trimmedName) {
      nextErrors.name = "Enter a project name so members can identify it.";
    }
    if (!resolvedCode || resolvedCode.length < 2) {
      nextErrors.code = "Enter a 2 to 6 character project key (e.g. CORE).";
    }
    if (!trimmedDesc) {
      nextErrors.description = "Add a concise description for the client dashboard card.";
    }
    if (memberIds.length === 0) {
      nextErrors.members = "Assign at least one team member to this project.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSaveProject({
      id: editingProject?.id,
      name: trimmedName,
      code: resolvedCode.slice(0, 6),
      description: trimmedDesc,
      accent,
      memberIds,
    });
    onClose();
  }

  const isEditMode = Boolean(editingProject);

  return (
    <BrutalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Project & Members" : "Create New Project"}
      description={
        isEditMode
          ? "Update project details and control which team members see this card on their dashboard."
          : "This project card will appear on the client dashboard for assigned team members."
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_130px]">
          <BrutalInput
            id="project-name"
            label="Project Name"
            placeholder="Mobile Checkout v2"
            value={name}
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              if (!isEditMode && !code) {
                // Keep manual code editable while offering a placeholder suggestion
              }
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            required
          />

          <BrutalInput
            id="project-code"
            label="Key"
            placeholder={deriveCode(name) || "MOB"}
            maxLength={6}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
              if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
            }}
            error={errors.code}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="project-description"
            className="block text-[14px] font-bold text-[var(--tb-ink)]"
          >
            Description
          </label>
          <textarea
            id="project-description"
            rows={3}
            placeholder="Outline the scope, deliverables, or active sprint goal for this project."
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? "project-description-error" : undefined}
            className={[
              "tb-tactile-motion block w-full resize-none rounded-[3px] border-2 px-3.5 py-2.5",
              "bg-[var(--tb-surface)] text-[15px] font-medium text-[var(--tb-ink)] placeholder:text-[var(--tb-placeholder)]",
              "focus:bg-[var(--tb-surface-focus)] focus:shadow-[var(--tb-shadow-sm)] focus:outline-none",
              "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
              errors.description
                ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] shadow-[var(--tb-shadow-error)]"
                : "border-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]",
            ].join(" ")}
          />
          {errors.description ? (
            <p
              id="project-description-error"
              role="alert"
              className="flex items-start gap-1.5 text-[13px] font-semibold text-[var(--tb-error)]"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errors.description}</span>
            </p>
          ) : null}
        </div>

        {/* Card accent color */}
        <fieldset className="space-y-2">
          <legend className="text-[14px] font-bold text-[var(--tb-ink)]">
            Card Tag Accent
          </legend>
          <div className="grid grid-cols-3 gap-2.5">
            {ACCENT_OPTIONS.map((option) => {
              const selected = accent === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAccent(option.value)}
                  aria-pressed={selected}
                  className={[
                    "tb-tactile-motion flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[3px] border-2 border-[var(--tb-ink)] px-2.5 py-2 text-[13px] font-bold text-[var(--tb-ink)]",
                    "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
                    option.bg,
                    selected
                      ? "shadow-[var(--tb-shadow-sm)] -translate-x-0.5 -translate-y-0.5"
                      : "opacity-75 hover:opacity-100",
                  ].join(" ")}
                >
                  {selected ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Assign Team Members */}
        <fieldset className="space-y-2">
          <legend className="text-[14px] font-bold text-[var(--tb-ink)]">
            Assign Team Members ({memberIds.length} selected)
          </legend>
          <div className="max-h-[190px] space-y-2 overflow-y-auto rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] p-2.5">
            {accounts.map((account) => {
              const checked = memberIds.includes(account.id);
              return (
                <label
                  key={account.id}
                  className={[
                    "flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-[2px] border-2 px-3 py-2 transition-colors",
                    checked
                      ? "border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-xs)]"
                      : "border-transparent bg-transparent hover:border-[var(--tb-ink)]/40 hover:bg-[var(--tb-surface)]/70",
                  ].join(" ")}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="relative inline-flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(account.id)}
                        className="peer sr-only"
                      />
                      <span
                        className={[
                          "inline-flex h-5 w-5 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)]",
                          "peer-focus-visible:outline-solid peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--tb-ink)]",
                          checked
                            ? "bg-[var(--tb-primary)]"
                            : "bg-[var(--tb-surface)]",
                        ].join(" ")}
                      >
                        {checked ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                      </span>
                    </span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[11px] font-bold text-[var(--tb-ink)]">
                      {getInitials(account.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-bold text-[var(--tb-ink)]">
                        {account.name}
                      </span>
                      <span className="block truncate text-[12px] font-medium text-[var(--tb-ink-muted)]">
                        {account.email}
                      </span>
                    </span>
                  </span>

                  <span
                    className={[
                      "shrink-0 rounded-[2px] border-2 border-[var(--tb-ink)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--tb-ink)]",
                      account.role === "admin"
                        ? "bg-[var(--tb-secondary)]"
                        : "bg-[var(--tb-accent)]",
                    ].join(" ")}
                  >
                    {account.role}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.members ? (
            <p
              role="alert"
              className="flex items-start gap-1.5 text-[13px] font-semibold text-[var(--tb-error)]"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errors.members}</span>
            </p>
          ) : null}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <BrutalButton
            type="button"
            variant="surface"
            onClick={onClose}
            className="sm:w-auto sm:min-w-[120px]"
          >
            Cancel
          </BrutalButton>
          <BrutalButton
            type="submit"
            variant="primary"
            className="sm:w-auto sm:min-w-[180px]"
          >
            {isEditMode ? "SAVE CHANGES" : "CREATE PROJECT"}
          </BrutalButton>
        </div>
      </form>
    </BrutalDialog>
  );
}
