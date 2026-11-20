"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/components/admin/types";
import { BrutalButton } from "@/components/login/brutal-button";
import { BrutalInput } from "@/components/login/brutal-input";
import {
  AlertIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/components/login/icons";

interface SettingsViewProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "member";
  };
}

interface NoticeState {
  tone: "success" | "error";
  message: string;
}

export function SettingsView({ currentUser }: SettingsViewProps) {
  const router = useRouter();

  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<NoticeState | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<NoticeState | null>(null);

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileNotice(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setProfileNotice({
        tone: "error",
        message: "Nama minimal terdiri dari 2 karakter.",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await authClient.updateUser({
        name: trimmedName,
      });

      if (result.error) {
        setProfileNotice({
          tone: "error",
          message:
            result.error.message || "Gagal memperbarui nama. Coba lagi.",
        });
        return;
      }

      setName(trimmedName);
      setProfileNotice({
        tone: "success",
        message: "Nama berhasil diperbarui.",
      });
      router.refresh();
    } catch {
      setProfileNotice({
        tone: "error",
        message: "Terjadi kesalahan jaringan saat menyimpan profil.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordNotice(null);

    if (!currentPassword) {
      setPasswordNotice({
        tone: "error",
        message: "Masukkan password saat ini terlebih dahulu.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordNotice({
        tone: "error",
        message: "Password baru minimal 8 karakter.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({
        tone: "error",
        message: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordNotice({
        tone: "error",
        message: "Password baru harus berbeda dari password saat ini.",
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });

      if (result.error) {
        setPasswordNotice({
          tone: "error",
          message:
            result.error.message ||
            "Gagal mengubah password. Pastikan password saat ini benar.",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice({
        tone: "success",
        message: "Password berhasil diubah.",
      });
    } catch {
      setPasswordNotice({
        tone: "error",
        message: "Terjadi kesalahan jaringan saat mengubah password.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
      <div className="border-b-[3px] border-[var(--tb-ink)] pb-6">
        <h1 className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--tb-ink)] sm:text-[40px]">
          Settings
        </h1>
        <p className="mt-2 max-w-[56ch] text-[15px] font-medium leading-[1.5] text-[var(--tb-ink-muted)]">
          Kelola nama tampilan akun dan perbarui password untuk keamanan workspace kamu.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Profile / Update Name */}
        <section className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-md)] sm:p-6">
          <div className="flex items-center gap-3 border-b-2 border-[var(--tb-ink)] pb-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] border-2 border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[16px] font-bold text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]">
              {getInitials(name || currentUser.name)}
            </span>
            <div className="min-w-0">
              <h2 className="text-[20px] font-bold text-[var(--tb-ink)]">
                Profil Akun
              </h2>
              <p className="text-[13px] font-medium text-[var(--tb-ink-muted)]">
                Ubah nama yang tampil di board, komentar QC, dan activity log.
              </p>
            </div>
          </div>

          {profileNotice ? (
            <div
              role={profileNotice.tone === "error" ? "alert" : "status"}
              className={[
                "mt-4 flex items-center gap-2 rounded-[3px] border-2 px-3.5 py-2.5 text-[13px] font-bold",
                profileNotice.tone === "error"
                  ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] text-[var(--tb-error)]"
                  : "border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
              ].join(" ")}
            >
              {profileNotice.tone === "error" ? (
                <AlertIcon className="h-4 w-4 shrink-0" />
              ) : (
                <CheckIcon className="h-4 w-4 shrink-0" />
              )}
              <span>{profileNotice.message}</span>
            </div>
          ) : null}

          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
            <BrutalInput
              id="settings-name"
              label="Nama Lengkap"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (profileNotice) setProfileNotice(null);
              }}
              placeholder="Masukkan nama lengkap"
              disabled={isSavingProfile}
              required
            />

            <div>
              <label
                htmlFor="settings-email"
                className="mb-1.5 block text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--tb-ink)]"
              >
                Email Kerja
              </label>
              <input
                id="settings-email"
                type="email"
                value={currentUser.email}
                readOnly
                disabled
                className="min-h-[48px] w-full cursor-not-allowed rounded-[3px] border-2 border-[var(--tb-ink)]/60 bg-[var(--tb-bg)] px-3.5 text-[14px] font-semibold text-[var(--tb-ink-muted)]"
              />
              <p className="mt-1 text-[12px] font-medium text-[var(--tb-ink-muted)]">
                Role akun:{" "}
                <span className="font-bold uppercase text-[var(--tb-ink)]">
                  {currentUser.role}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <BrutalButton
                type="submit"
                variant="primary"
                isLoading={isSavingProfile}
                loadingLabel="MENYIMPAN..."
              >
                SIMPAN NAMA
              </BrutalButton>
            </div>
          </form>
        </section>

        {/* Card 2: Change Password */}
        <section className="rounded-[4px] border-[3px] border-[var(--tb-ink)] bg-[var(--tb-surface)] p-5 shadow-[var(--tb-shadow-md)] sm:p-6">
          <div className="border-b-2 border-[var(--tb-ink)] pb-4">
            <h2 className="text-[20px] font-bold text-[var(--tb-ink)]">
              Ubah Password
            </h2>
            <p className="mt-0.5 text-[13px] font-medium text-[var(--tb-ink-muted)]">
              Gunakan password minimal 8 karakter untuk menjaga keamanan akunmu.
            </p>
          </div>

          {passwordNotice ? (
            <div
              role={passwordNotice.tone === "error" ? "alert" : "status"}
              className={[
                "mt-4 flex items-center gap-2 rounded-[3px] border-2 px-3.5 py-2.5 text-[13px] font-bold",
                passwordNotice.tone === "error"
                  ? "border-[var(--tb-error)] bg-[var(--tb-error-bg)] text-[var(--tb-error)]"
                  : "border-[var(--tb-ink)] bg-[var(--tb-primary)] text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-xs)]",
              ].join(" ")}
            >
              {passwordNotice.tone === "error" ? (
                <AlertIcon className="h-4 w-4 shrink-0" />
              ) : (
                <CheckIcon className="h-4 w-4 shrink-0" />
              )}
              <span>{passwordNotice.message}</span>
            </div>
          ) : null}

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <BrutalInput
              id="settings-current-password"
              label="Password Saat Ini"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                if (passwordNotice) setPasswordNotice(null);
              }}
              placeholder="Masukkan password saat ini"
              disabled={isSavingPassword}
              required
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[2px] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]"
                >
                  {showCurrentPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <BrutalInput
              id="settings-new-password"
              label="Password Baru"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                if (passwordNotice) setPasswordNotice(null);
              }}
              placeholder="Minimal 8 karakter"
              disabled={isSavingPassword}
              required
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[2px] text-[var(--tb-ink)] hover:bg-[var(--tb-bg)]"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <BrutalInput
              id="settings-confirm-password"
              label="Konfirmasi Password Baru"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (passwordNotice) setPasswordNotice(null);
              }}
              placeholder="Ulangi password baru"
              disabled={isSavingPassword}
              required
            />

            <label
              htmlFor="settings-revoke-sessions"
              className="flex cursor-pointer select-none items-center gap-2.5 pt-1"
            >
              <input
                id="settings-revoke-sessions"
                type="checkbox"
                checked={revokeOtherSessions}
                onChange={(event) =>
                  setRevokeOtherSessions(event.target.checked)
                }
                disabled={isSavingPassword}
                className="h-4 w-4 accent-[var(--tb-ink)]"
              />
              <span className="text-[13px] font-semibold text-[var(--tb-ink)]">
                Keluar dari sesi perangkat lain setelah password diubah
              </span>
            </label>

            <div className="pt-2">
              <BrutalButton
                type="submit"
                variant="primary"
                isLoading={isSavingPassword}
                loadingLabel="MEMPERBARUI..."
              >
                PERBARUI PASSWORD
              </BrutalButton>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
