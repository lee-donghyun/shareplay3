import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
  openGraph: {
    title: "Welcome to Shareplay",
    description: "Set up your profile to get started with Shareplay.",
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
