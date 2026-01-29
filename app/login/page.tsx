"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HttpError } from "@/features/api";
import { useAuth } from "@/features/auth";
import { GameLayout, PixelButton, PixelCard } from "@/features/ui";

export default function LoginPage() {
  const router = useRouter();
  const { status, login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    router.replace("/lessons");
    return null;
  }

  return (
    <GameLayout title="Login" subtitle="Load your save file and continue.">
      <PixelCard title="Adventurer Login">
        {error && (
          <div className="pixel-frame mb-4 bg-[color:var(--pixel-panel-2)] p-3 text-xl text-[color:var(--game-danger)]">
            {error}
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            try {
              await login({ identifier, password });
              router.replace("/lessons");
            } catch (err) {
              if (err instanceof HttpError) setError(err.message);
              else setError("Login failed. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
              Email or Username
            </span>
            <input
              className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
              placeholder="hero@example.com"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
              Password
            </span>
            <input
              className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <PixelButton size="lg" variant="primary" type="submit" loading={submitting}>
              Enter
            </PixelButton>
            <Link href="/register" className="inline-flex">
              <PixelButton size="lg" variant="secondary" type="button">
                New Player
              </PixelButton>
            </Link>
          </div>
        </form>
      </PixelCard>
    </GameLayout>
  );
}
