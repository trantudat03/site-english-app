"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

import type { Profile } from "@/features/profile";
import { getMyProfile } from "@/features/profile";
import { RequireAuth, useAuth } from "@/features/auth";
import { ErrorScreen, GameLayout, LoadingScreen, PixelButton, PixelCard } from "@/features/ui";
import { SettingsModal } from "@/components/profile/SettingsModal";
import { GlobalModalRef } from "@/features/ui/modal";
import { AvatarUploader } from "@/components/profile/AvatarUploader";

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const settingsRef = useRef<GlobalModalRef>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await getMyProfile();
        if (!active) return;
        setProfile(me);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load profile.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <RequireAuth>
        <ErrorScreen title="Profile Failed" message={error} backHref="/" onRetry={() => location.reload()} />
      </RequireAuth>
    );
  }

  if (!profile) {
    return (
      <RequireAuth>
        <LoadingScreen title="Loading Profile" />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <GameLayout title="Profile" subtitle="Your character sheet." backHref="/">
        <PixelCard title="Player"
          right={
            <PixelButton
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 flex items-center justify-center"
              onClick={() => settingsRef.current?.open()}
            >
              <span className="material-symbols-outlined text-[var(--clay-dark)]">
                settings
              </span>
            </PixelButton>
          }
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:pr-20">
              {/* LEFT - TEXT */}
              <div className="flex-1 text-2xl leading-7 text-[color:var(--game-fg)]">
                <div>
                  <span className="text-[color:var(--game-muted)]">Username:</span>{" "}
                  {profile.username}
                </div>
                {profile.email && (
                  <div className="mt-2">
                    <span className="text-[color:var(--game-muted)]">Email:</span>{" "}
                    {profile.email}
                  </div>
                )}
              </div>

              {/* RIGHT - AVATAR */}
              <div className="self-center">
                <AvatarUploader
                profile={profile}
                onUploaded={async () => {
                  const me = await getMyProfile();
                  setProfile(me);
                }}
              />
              </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/lessons" className="inline-flex">
              <PixelButton size="lg" variant="primary">
                Play
              </PixelButton>
            </Link>
            <Link href="/history" className="inline-flex">
              <PixelButton size="lg" variant="secondary">
                History
              </PixelButton>
            </Link>
            <PixelButton size="lg" variant="danger" onClick={logout}>
              Logout
            </PixelButton>
          </div>
        </PixelCard>
        <SettingsModal ref={settingsRef} />
      </GameLayout>

    </RequireAuth>
  );
}
