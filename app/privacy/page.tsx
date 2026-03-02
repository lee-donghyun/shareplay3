import { Header } from "@/components/header";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh flex flex-col pt-[52px]">
      <Header left="muted" right="none" />

      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              개인정보처리방침
            </h1>
            <p className="text-sm text-muted-foreground">
              최종 수정일: 2026년 3월 2일
            </p>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                1. 수집하는 개인정보
              </h2>
              <p>
                Shareplay는 서비스 제공을 위해 다음과 같은 개인정보를
                수집합니다:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Google 계정 정보 (이메일, 이름, 프로필 사진)</li>
                <li>사용자가 설정한 핸들(handle) 및 프로필 메시지</li>
                <li>사용자가 추가한 플레이리스트 정보</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                2. 개인정보의 이용 목적
              </h2>
              <p>수집된 개인정보는 다음의 목적으로 이용됩니다:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>서비스 회원 식별 및 인증</li>
                <li>플레이리스트 공유 서비스 제공</li>
                <li>사용자 프로필 페이지 구성</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                3. 개인정보의 보유 및 이용 기간
              </h2>
              <p>
                회원 탈퇴 시 또는 수집 목적이 달성된 후에는 해당 정보를 지체
                없이 파기합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                4. 개인정보의 제3자 제공
              </h2>
              <p>
                Shareplay는 사용자의 동의 없이 개인정보를 제3자에게 제공하지
                않습니다. 다만, 법령에 의해 요구되는 경우는 예외로 합니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                5. 개인정보의 안전성 확보 조치
              </h2>
              <p>
                Shareplay는 개인정보의 안전성 확보를 위해 Supabase의 보안
                인프라를 활용하며, 데이터는 암호화되어 전송 및 저장됩니다.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-medium text-foreground">
                6. 문의
              </h2>
              <p>
                개인정보 처리에 관한 문의는 서비스 내 문의 기능을 통해 접수할
                수 있습니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
