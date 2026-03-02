"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-foreground">Error</h1>
        <p className="text-muted-foreground">Something went wrong.</p>
        <Button variant="link" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
