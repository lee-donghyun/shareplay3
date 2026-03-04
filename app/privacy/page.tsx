import { Header } from "@/components/header";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh flex flex-col pt-[52px]">
      <Header left="muted" right="none" />

      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: March 2, 2026
            </p>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                1. Personal Information We Collect
              </h2>
              <p>
                Shareplay collects the following personal information to provide
                its services:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Google account information (email, name, profile picture)
                </li>
                <li>User-configured handle and profile message</li>
                <li>Playlist information added by the user</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                2. Purpose of Use
              </h2>
              <p>
                The collected personal information is used for the following
                purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>User identification and authentication</li>
                <li>Providing the playlist sharing service</li>
                <li>Building user profile pages</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                3. Retention Period
              </h2>
              <p>
                Personal information is promptly deleted upon account deletion
                or once the purpose of collection has been fulfilled.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                4. Disclosure to Third Parties
              </h2>
              <p>
                Shareplay does not provide personal information to third parties
                without the user&apos;s consent, except as required by law.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                5. Security Measures
              </h2>
              <p>
                Shareplay leverages Supabase&apos;s security infrastructure to
                protect personal information. Data is encrypted during
                transmission and storage.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                6. Contact
              </h2>
              <p>
                For inquiries regarding the processing of personal information,
                please reach out through the in-app contact feature.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
