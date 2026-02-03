"use client";

import { useRef, useState } from "react";
import { PixelButton } from "@/features/ui";
import { useAuth } from "@/features/auth";

export function AccountTab() {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const startedRef = useRef(false);

  const handleChangePassword = async () => {
    if (startedRef.current) return;

    startedRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await changePassword({
        currentPassword,
        password,
        passwordConfirmation,
      });

      setSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change password.");
    } finally {
      setLoading(false);
      startedRef.current = false;
    }
  };

  return (
    <section className="space-y-10 max-w-xl">
      <div>
        <div className="pixel-text-title text-lg mb-1">
          CHANGE PASSWORD
        </div>
        <div className="text-xs text-[color:var(--game-muted)]">
          Update your account security
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        {/* Current */}
        <label className="col-span-2 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest opacity-80">
            Current password
          </span>
          <input
            className="pixel-frame bg-[color:var(--pixel-panel-2)] p-4 w-full"
            placeholder="Enter your current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        {/* New */}
        <label className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest opacity-80">
            New password
          </span>
          <input
            className="pixel-frame bg-[color:var(--pixel-panel-2)] p-4 w-full"
            placeholder="At least 6 characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>

        {/* Confirm */}
        <label className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest opacity-80">
            Confirm password
          </span>
          <input
            className="pixel-frame bg-[color:var(--pixel-panel-2)] p-4 w-full"
            placeholder="Repeat new password"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={loading}
          />
        </label>
      </div>

      {/* FEEDBACK */}
      {error && (
        <div className="pixel-frame p-3 text-sm text-[color:var(--game-danger)]">
          {error}
        </div>
      )}

      {success && (
        <div className="pixel-frame p-3 text-sm text-[color:var(--game-accent-2)]">
          Password changed successfully!
        </div>
      )}

      <div>
        <PixelButton
          loading={loading}
          disabled={loading}
          onClick={handleChangePassword}
        >
          Update password
        </PixelButton>
      </div>
    </section>
  );
}
