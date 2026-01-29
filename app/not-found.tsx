import Link from "next/link";

import { GameLayout, PixelButton, PixelCard } from "@/features/ui";

export default function NotFound() {
  return (
    <GameLayout title="404" subtitle="That portal leads nowhere.">
      <PixelCard title="Not Found" subtitle="Return to safety.">
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="inline-flex">
            <PixelButton size="lg" variant="primary">
              Main Menu
            </PixelButton>
          </Link>
          <Link href="/lessons" className="inline-flex">
            <PixelButton size="lg" variant="secondary">
              Level Select
            </PixelButton>
          </Link>
        </div>
      </PixelCard>
    </GameLayout>
  );
}

