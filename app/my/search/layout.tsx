import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  openGraph: {
    title: "Search - Shareplay",
    description: "Search for songs to add to your Shareplay playlist.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
