"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { BrutalButton } from "./brutal-button";
import { BrutalInput } from "./brutal-input";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "./icons";

interface FieldErrors {
  email?: string;
  password?: string;
}

interface StatusNotice {
  tone: "success" | "error" | "info";
  title: string;
  message: string;
  showSignOut?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<StatusNotice | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notice && noticeRef.current) {
      noticeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [notice]);

  function validateEmail(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Enter your work email address to continue.";
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      return "Enter a valid email address (for example, admin@techbro.dev).";
    }
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) {
      return "Enter your password to unlock your workspace.";
    }
    return undefined;
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
    if (notice) {
      setNotice(null);
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
    if (notice) {
      setNotice(null);
    }
  }

  async function handleSignOutMember() {
    await authClient.signOut();
    setNotice(null);
    setPassword("");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const validationErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(validationErrors);

    if (validationErrors.email) {
      emailRef.current?.focus();
      return;
    }

    if (validationErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      if (result.error) {
        setIsSubmitting(false);
        setNotice({
          tone: "error",
          title: "Sign-in failed",
          message:
            result.error.message ||
            "Invalid email or password. Check your credentials and try again.",
        });
        return;
      }

      const sessionResult = await authClient.getSession();
      const role = sessionResult.data?.user?.role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
      return;
    } catch {
      setIsSubmitting(false);
      setNotice({
        tone: "error",
        title: "Connection error",
        message: "Could not reach the authentication server. Please try again.",
      });
    }
  }

  return (
    <section
      id="login-card"
      tabIndex={-1}
      aria-labelledby="login-heading"
      className="relative flex flex-1 items-start justify-center px-4 py-5 outline-none sm:items-center sm:px-8 sm:py-10 lg:min-h-dvh lg:px-10 xl:px-14"
    >
      <div className="w-full max-w-[460px]">
        <div className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-lg)] sm:p-8">
          <div className="mb-4 sm:mb-6">
            <h2
              id="login-heading"
              className="text-[26px] font-bold leading-[1.1] tracking-[-0.025em] text-[var(--tb-ink)] sm:text-[32px]"
            >
              Welcome Back!
            </h2>
            <p className="mt-1 text-[14px] font-medium leading-[1.45] text-[var(--tb-ink-muted)] sm:mt-1.5 sm:text-[15px]">
              Let&apos;s get you back into your workspace.
            </p>
          </div>

          {notice ? (
            <div
              ref={noticeRef}
              role={notice.tone === "error" ? "alert" : "status"}
              aria-live={notice.tone === "error" ? "assertive" : "polite"}
              className={[
                "mb-4 rounded-[3px] border-2 p-3.5 text-[13px] leading-snug sm:mb-5",
                notice.tone === "error"
                  ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] text-[var(--tb-error)] shadow-[var(--tb-shadow-error)]"
                  : notice.tone === "success"
                    ? "border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]"
                    : "border-[var(--tb-ink)] bg-[var(--tb-bg)] text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-bold tracking-[0.01em]">
                    {notice.tone === "error" ? (
                      <AlertIcon className="h-4 w-4 shrink-0" />
                    ) : null}
                    <span>{notice.title}</span>
                  </p>
                  <p className="mt-0.5 font-medium">{notice.message}</p>
                  {notice.showSignOut ? (
                    <button
                      type="button"
                      onClick={handleSignOutMember}
                      className="mt-2.5 inline-flex min-h-[44px] cursor-pointer items-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] px-3 py-1.5 text-[13px] font-bold text-[var(--tb-ink)] shadow-[var(--tb-shadow-xs)] hover:bg-[var(--tb-bg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                    >
                      Sign out
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  aria-label="Dismiss notice"
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] bg-[var(--tb-surface)] text-[18px] font-bold leading-none text-[var(--tb-ink)] hover:bg-[var(--tb-secondary)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)]"
                >
                  ×
                </button>
              </div>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-3.5 sm:space-y-5"
          >
            <BrutalInput
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              inputMode="email"
              placeholder="admin@techbro.dev"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              onBlur={() => {
                if (email.trim()) {
                  setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
                }
              }}
              error={errors.email}
              disabled={isSubmitting}
              required
            />

            <BrutalInput
              ref={passwordRef}
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              error={errors.password}
              disabled={isSubmitting}
              required
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[2px] text-[var(--tb-ink)] transition-colors hover:bg-[var(--tb-bg)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-[var(--tb-ink)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="login-remember"
                className="group inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2.5 pr-2"
              >
                <span className="relative inline-flex items-center justify-center">
                  <input
                    id="login-remember"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <span
                    className={[
                      "tb-tactile-motion inline-flex h-5 w-5 items-center justify-center rounded-[2px] border-2 border-[var(--tb-ink)] transition-[background-color,box-shadow] duration-150",
                      "peer-focus-visible:outline-solid peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--tb-ink)]",
                      rememberMe
                        ? "bg-[var(--tb-primary)] shadow-[var(--tb-shadow-xs)]"
                        : "bg-[var(--tb-surface)] group-hover:bg-[var(--tb-bg)]",
                    ].join(" ")}
                  >
                    {rememberMe ? (
                      <CheckIcon className="h-3.5 w-3.5 text-[var(--tb-ink)]" />
                    ) : null}
                  </span>
                </span>
                <span className="text-[14px] font-semibold text-[var(--tb-ink)]">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setNotice({
                    tone: "info",
                    title: "Need a password reset?",
                    message:
                      "Contact your TECH BRO workspace administrator to reset your password.",
                  })
                }
                className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[2px] px-1.5 text-[14px] font-bold text-[var(--tb-ink)] underline decoration-2 underline-offset-4 transition-colors hover:bg-[var(--tb-primary)] focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-ink)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-1">
              <BrutalButton
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                loadingLabel="ENTERING WORKSPACE..."
              >
                <span>LET&apos;S GO!</span>
                <ArrowRightIcon className="h-5 w-5" />
              </BrutalButton>
            </div>
          </form>

          <p className="mt-5 text-center text-[13px] font-medium text-[var(--tb-ink-muted)] sm:mt-6">
            Access is provisioned by your workspace administrator.
          </p>
        </div>
      </div>
    </section>
  );
}
