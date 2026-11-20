"use client";

import { useState, type FormEvent } from "react";
import { BrutalButton } from "@/components/login/brutal-button";
import { BrutalInput } from "@/components/login/brutal-input";
import { CheckIcon, EyeIcon, EyeOffIcon } from "@/components/login/icons";
import { KeyIcon } from "./admin-icons";
import { BrutalDialog } from "./brutal-dialog";
import type { AccountRole, AdminProject } from "./types";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingEmails: string[];
  projects: AdminProject[];
  onAddAccount: (payload: {
    name: string;
    email: string;
    role: AccountRole;
    password: string;
    projectIds: string[];
  }) => Promise<string | void>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTempPassword(): string {
  const words = ["Build", "Ship", "Sync", "Code", "Grid"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}#${num}!`;
}

export function AccountModal({
  isOpen,
  onClose,
  existingEmails,
  projects,
  onAddAccount,
}: AccountModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [role, setRole] = useState<AccountRole>("member");
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleProject(projectId: string) {
    setProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const nextErrors: typeof errors = {};

    if (!trimmedName) {
      nextErrors.name = "Enter the team member's full name.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Enter a work email address.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address (e.g. alex@techbro.dev).";
    } else if (existingEmails.includes(trimmedEmail)) {
      nextErrors.email = "An account with this email already exists.";
    }

    if (!password) {
      nextErrors.password = "Set an initial password or generate one.";
    } else if (password.length < 8) {
      nextErrors.password = "Initial password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const serverError = await onAddAccount({
      name: trimmedName,
      email: trimmedEmail,
      role,
      password,
      projectIds,
    });
    setIsSubmitting(false);

    if (serverError) {
      setErrors({ form: serverError });
      return;
    }

    onClose();
  }

  return (
    <BrutalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Account"
      description="Provision a workspace login for a teammate. No public sign-up required."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form ? (
          <div
            role="alert"
            className="rounded-[3px] border-2 border-[var(--tb-error)] bg-[var(--tb-error-bg)] px-3.5 py-2.5 text-[13px] font-bold text-[var(--tb-error)]"
          >
            {errors.form}
          </div>
        ) : null}
        <BrutalInput
          id="account-name"
          label="Full Name"
          placeholder="Alex Morgan"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          required
        />

        <BrutalInput
          id="account-email"
          type="email"
          inputMode="email"
          label="Work Email"
          placeholder="alex@techbro.dev"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
        />

        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <BrutalInput
                id="account-password"
                type={showPassword ? "text" : "password"}
                label="Initial Password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                error={errors.password}
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[2px] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-[var(--tb-ink)]"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setPassword(generateTempPassword());
                setShowPassword(true);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className="tb-tactile-motion inline-flex min-h-[48px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-3.5 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-primary)] hover:text-[var(--tb-on-accent)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
            >
              <KeyIcon className="h-4 w-4" />
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Role selector */}
        <fieldset className="space-y-2">
          <legend className="text-[14px] font-bold text-[var(--tb-ink)]">
            Workspace Role
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: "member",
                  label: "Member",
                  detail: "Assigned projects & Kanban boards",
                  activeBg: "bg-[var(--tb-accent)]",
                },
                {
                  value: "admin",
                  label: "Admin",
                  detail: "Create projects & manage accounts",
                  activeBg: "bg-[var(--tb-secondary)]",
                },
              ] as const
            ).map((item) => {
              const selected = role === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  aria-pressed={selected}
                  className={[
                    "tb-tactile-motion flex min-h-[64px] cursor-pointer flex-col items-start justify-center rounded-[3px] border-2 border-[var(--tb-ink)] px-3.5 py-2.5 text-left",
                    "focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]",
                    selected
                      ? `${item.activeBg} text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-sm)]`
                      : "bg-[var(--tb-surface)] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-1.5 text-[14px] font-bold">
                    {selected ? <CheckIcon className="h-4 w-4" /> : null}
                    {item.label}
                  </span>
                  <span className="mt-0.5 text-[12px] font-medium leading-tight opacity-90">
                    {item.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Optional initial project assignment */}
        {projects.length > 0 ? (
          <fieldset className="space-y-2">
            <legend className="text-[14px] font-bold text-[var(--tb-ink)]">
              Assign to Projects (optional)
            </legend>
            <div className="max-h-[150px] space-y-1.5 overflow-y-auto rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] p-2.5">
              {projects.map((project) => {
                const checked = projectIds.includes(project.id);
                return (
                  <label
                    key={project.id}
                    className={[
                      "flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-[2px] border-2 px-3 py-1.5",
                      checked
                        ? "border-[var(--tb-ink)] bg-[var(--tb-surface)] shadow-[var(--tb-shadow-xs)]"
                        : "border-transparent hover:bg-[var(--tb-surface)]/70",
                    ].join(" ")}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="relative inline-flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProject(project.id)}
                          className="peer sr-only"
                        />
                        <span
                          className={[
                            "inline-flex h-5 w-5 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)]",
                            "peer-focus-visible:outline-solid peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--tb-ink)]",
                            checked
                              ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)]"
                              : "bg-[var(--tb-surface)]",
                          ].join(" ")}
                        >
                          {checked ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                        </span>
                      </span>
                      <span className="truncate text-[14px] font-bold text-[var(--tb-ink)]">
                        {project.name}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-bg)] px-2 py-0.5 text-[11px] font-bold tracking-[0.06em] text-[var(--tb-ink)]">
                      {project.code}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

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
            isLoading={isSubmitting}
            loadingLabel="CREATING..."
            className="sm:w-auto sm:min-w-[180px]"
          >
            CREATE ACCOUNT
          </BrutalButton>
        </div>
      </form>
    </BrutalDialog>
  );
}
