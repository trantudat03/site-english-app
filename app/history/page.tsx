import { HistoryListClient } from "@/components/history/HistoryListClient";
import { RequireAuth } from "@/features/auth";
import { GameLayout } from "@/features/ui";

export default function HistoryPage() {
  return (
    <RequireAuth>
      <GameLayout title="Lesson History" subtitle="Your previous submissions." backHref="/">
        <HistoryListClient />
      </GameLayout>
    </RequireAuth>
  );
}
