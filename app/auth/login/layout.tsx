import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  openGraph: {
    title: "Sign In - Shareplay",
    description: "Sign in to create and share your playlist on Shareplay.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
