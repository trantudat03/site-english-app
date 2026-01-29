"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HttpError } from "@/features/api";
import { useAuth } from "@/features/auth";
import { GameLayout, PixelButton, PixelCard } from "@/features/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { status, register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    router.replace("/lessons");
    return null;
  }

  return (
    <GameLayout title="Register" subtitle="Create a new character.">
      <PixelCard title="New Player">
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
              await register({ username, email, password });
              router.replace("/lessons");
            } catch (err) {
              if (err instanceof HttpError) setError(err.message);
              else setError("Register failed. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
              Username
            </span>
            <input
              className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
              placeholder="pixelHero"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="pixel-text-title text-xs text-[color:var(--game-fg)]">
              Email
            </span>
            <input
              className="pixel-frame bg-[color:var(--pixel-panel-2)] px-3 py-3 text-2xl text-[color:var(--game-fg)] placeholder:text-[color:var(--game-muted)] focus:outline-none"
              placeholder="hero@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <PixelButton size="lg" variant="primary" type="submit" loading={submitting}>
              Create
            </PixelButton>
            <Link href="/login" className="inline-flex">
              <PixelButton size="lg" variant="secondary" type="button">
                I Have an Account
              </PixelButton>
            </Link>
          </div>
        </form>
      </PixelCard>
    </GameLayout>
  );
}

