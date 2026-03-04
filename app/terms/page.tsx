import { Header } from "@/components/header";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-dvh flex flex-col pt-[52px]">
      <Header left="muted" right="none" />

      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: March 2, 2026
            </p>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                1. Service Overview
              </h2>
              <p>
                Shareplay is a web service that allows users to build their own
                music playlists and share them with others.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                2. Eligibility
              </h2>
              <p>
                Anyone with a Google account is eligible to use this service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                3. User Obligations
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Users must not post content that infringes on the rights of
                  others.
                </li>
                <li>
                  Users must not interfere with the normal operation of the
                  service.
                </li>
                <li>
                  Users must not provide false information or impersonate
                  others.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                4. Service Restrictions
              </h2>
              <p>
                Shareplay may restrict access to the service without prior
                notice in the following cases:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Violation of these terms</li>
                <li>Interference with service operations</li>
                <li>Actions that violate applicable laws</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                5. Disclaimer
              </h2>
              <p>
                Shareplay is not responsible for the content of playlists shared
                by users. Music information is provided through the Apple iTunes
                Search API, and its accuracy depends on that service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                6. Changes to Terms
              </h2>
              <p>
                These terms may be updated as needed for service operations. Any
                changes will be announced through in-app notifications.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
