import { AttemptResultClient } from "@/components/result/AttemptResultClient";
import { RequireAuth } from "@/features/auth";
import { GameLayout } from "@/features/ui";

export default function HistoryAttemptDetailPage() {
  return (
    <RequireAuth>
      <GameLayout title="Attempt Result" subtitle="Review your answers." backHref="/history">
        <AttemptResultClient />
      </GameLayout>
    </RequireAuth>
  );
}

