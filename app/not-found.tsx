import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-foreground">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
        <Link
          href="/"
          className="inline-block text-sm text-primary hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
