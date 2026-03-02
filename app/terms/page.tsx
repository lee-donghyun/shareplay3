import { Header } from "@/components/header";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-dvh flex flex-col pt-[52px]">
      <Header left="muted" right="none" />

      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              서비스 약관
            </h1>
            <p className="text-sm text-muted-foreground">
              최종 수정일: 2026년 3월 2일
            </p>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                1. 서비스 개요
              </h2>
              <p>
                Shareplay는 사용자가 자신의 음악 플레이리스트를 구성하고 다른
                사람과 공유할 수 있는 웹 서비스입니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                2. 이용 자격
              </h2>
              <p>
                본 서비스는 Google 계정을 보유한 사용자라면 누구나 이용할 수
                있습니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                3. 사용자의 의무
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>타인의 권리를 침해하는 콘텐츠를 게시하지 않아야 합니다.</li>
                <li>서비스의 정상적인 운영을 방해하지 않아야 합니다.</li>
                <li>
                  부정확한 정보를 제공하거나 타인을 사칭하지 않아야 합니다.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                4. 서비스 이용 제한
              </h2>
              <p>
                Shareplay는 다음의 경우 사전 통보 없이 서비스 이용을 제한할 수
                있습니다:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>본 약관을 위반한 경우</li>
                <li>서비스 운영을 방해한 경우</li>
                <li>법령에 위반되는 행위를 한 경우</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                5. 면책 조항
              </h2>
              <p>
                Shareplay는 사용자가 공유한 플레이리스트의 콘텐츠에 대해
                책임지지 않습니다. 음악 정보는 Apple iTunes Search API를 통해
                제공되며, 정보의 정확성은 해당 서비스에 의존합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                6. 약관의 변경
              </h2>
              <p>
                본 약관은 서비스 운영상 필요한 경우 변경될 수 있으며, 변경 시
                서비스 내 공지를 통해 안내합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
