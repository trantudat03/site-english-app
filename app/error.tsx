"use client";

import { ErrorScreen } from "@/features/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen title="Game Crashed" message={error.message} backHref="/" onRetry={reset} />;
}

