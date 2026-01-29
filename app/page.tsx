"use client";

import Link from "next/link";

import { useAuth } from "@/features/auth";
import { GameLayout, PixelButton, PixelCard } from "@/features/ui";

export default function Home() {
  const { status, user } = useAuth();

  return (
    <GameLayout
      title="Pixel English Quest"
      subtitle="Choose a stage. Answer fast. Level up your English."
    >
      <PixelCard
        title="Main Menu"
        subtitle={
          status === "authenticated"
            ? `Welcome back, ${user?.username ?? "Adventurer"}`
            : "Log in to save your progress."
        }
      >
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href="/lessons" className="inline-flex">
            <PixelButton size="lg" variant="primary">
              Play
            </PixelButton>
          </Link>
          {status === "authenticated" ? (
            <>
              <Link href="/profile" className="inline-flex">
                <PixelButton size="lg" variant="secondary">
                  Profile
                </PixelButton>
              </Link>
              <Link href="/history" className="inline-flex">
                <PixelButton size="lg" variant="ghost">
                  History
                </PixelButton>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex">
                <PixelButton size="lg" variant="secondary">
                  Login
                </PixelButton>
              </Link>
              <Link href="/register" className="inline-flex">
                <PixelButton size="lg" variant="ghost">
                  Register
                </PixelButton>
              </Link>
            </>
          )}
        </div>
      </PixelCard>
    </GameLayout>
  );
}
