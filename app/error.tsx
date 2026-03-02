"use client";

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
        <button
          onClick={reset}
          className="inline-block text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
