# shareplay

## 개요

플레이리스트 공유를 위한 웹 앱.

### 기술 개요

- next.js app router
- supabase (auth, db)
- tailwind css
- shadcn/ui
- coverflow
- itunes search api
- use-gesture (드래그 앤 드랍 정렬)
- sonner (토스트 알림)

#### 기술 통합 명세

##### next.js

- app router 사용

##### supabase

- .env.local 의 값을 참고한다. (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- auth: google provider 를 활용한 로그인 기능을 구현한다.
  - 문서를 참고한다. https://supabase.com/docs/guides/auth/social-login/auth-google
  - Google Cloud Console 설정:
    - OAuth 2.0 Client ID 생성 (Web Application 유형)
    - Authorized redirect URIs: `{SUPABASE_URL}/auth/v1/callback`
    - Client ID / Client Secret 을 Supabase Dashboard > Auth > Providers > Google 에 입력
  - 콜백 경로: `/auth/callback` (next.js route handler 로 구현)

##### DB 스키마

- `profiles` 테이블
  - `id` (uuid, PK, references auth.users.id)
  - `handle` (text, unique, not null) — 프로필 공개 URL 기준
  - `message` (text, default '')
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `playlist_tracks` 테이블
  - `id` (uuid, PK, default gen_random_uuid())
  - `user_id` (uuid, references profiles.id, not null)
  - `track_id` (bigint, not null) — iTunes trackId
  - `track_name` (text, not null)
  - `artist_name` (text, not null)
  - `collection_name` (text)
  - `artwork_url` (text)
  - `preview_url` (text)
  - `track_view_url` (text)
  - `position` (integer, not null) — 정렬 순서
  - `created_at` (timestamptz, default now())
  - unique constraint: `(user_id, track_id)` — 트랙 중복 추가 비허용

##### RLS (Row Level Security)

- `profiles`
  - SELECT: 모든 유저에게 공개 (anon, authenticated)
  - INSERT/UPDATE: `auth.uid() = id` 인 경우만 허용
- `playlist_tracks`
  - SELECT: 모든 유저에게 공개 (anon, authenticated)
  - INSERT/UPDATE/DELETE: `auth.uid() = user_id` 인 경우만 허용

##### 라우팅

- `/` — 랜딩 페이지 (비로그인 시 소개 표시, 로그인 시 리다이렉트)
- `/auth/login` — 유저 인증 페이지
- `/auth/callback` — OAuth 콜백 route handler
- `/auth/onboarding` — 최초 로그인 시 프로필 설정 페이지
- `/u/[handle]` — 프로필 페이지 (공개)
- `/my` — 유저 프로필 페이지 (로그인 필수)
- `/my/search` — 곡 검색 페이지 (로그인 필수)
- `/privacy` — 개인정보처리방침 페이지
- `/terms` — 서비스 약관 페이지

##### shadcn/ui

- 필요한 ui 는 shadcn/ui 를 우선 활용하여 구현한다.

##### coverflow

- example/coverflow 를 참고하여 커버플로우 컴포넌트를 구현한다.
- 로직은 유지하되, 스타일은 tailwindcss를 사용하여 구현한다.

##### itunes search api

- 곡 검색을 위해 itunes search api 를 활용한다.
- https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1
- previewUrl 을 활용하여 곡 미리듣기를 구현한다.
- trackName, artistName, collectionName, artworkUrl100 등의 정보를 활용하여 coverflow 에서 곡 정보를 표시한다.

## 기능 명세

- 컴포넌트/페이지 단위로 웹 앱의 기능을 명세한다.
- 모바일 뷰를 우선으로 고려하여 설계한다.
- 큰 화면(md 이상)에서는 콘텐츠를 `max-w-2xl` 로 제한하고 중앙 정렬한다.
- 헤더, 하단 고정 바 등도 동일한 `max-w-2xl` 제약을 적용한다.
- 커버플로우는 모바일에서 200px, md 이상에서 300px 크기로 표시한다.
- 로그인/온보딩 폼은 `max-w-sm md:max-w-md` 로 화면에 맞게 확장한다.
- 다크모드만 지원한다. (shadcn/ui 의 다크모드 활용, `<html class="dark">` 고정)
- 가능한 shadcn/ui 의 컴포넌트를 활용하여 구현한다. (예: 버튼, 입력창, 모달 등)
- 트랙 중복 추가는 허용하지 않는다. (동일 `trackId` 기준)
- sonner 토스트의 Undo 유효 시간: 5초

### 헤더 컴포넌트

상단 고정 헤더

- left:
  - none: 로고 흰색으로 표시 (텍스트 로고, Geist font, font-weight: 600)
  - muted(default): 로고 회색으로 표시 (텍스트 로고, Geist font, font-weight: 600)
- right:
  - none(default): 표시하지 않음
  - profile:
    - 로그인한 유저
      - 이름과 프로필 사진
      - 선택시 드랍다운 오픈
        - title: "{user handle}"
        - "My Shareplay" (/u/{user handle} 페이지로 이동)
        - "My Profile" (/my 페이지로 이동)
        - "Logout" (로그아웃)
    - 로그인하지 않은 유저
      - 로그인 버튼 (유저 인증 페이지로 이동)
- 캐시:
  - 모듈 레벨 캐시를 사용하여 클라이언트 네비게이션 간 프로필 데이터를 유지한다.
  - 프로필 업데이트 시 `updateProfileCache`를 호출하여 캐시를 갱신하고 헤더 컴포넌트에 즉시 반영한다.
  - 로그아웃 시 `invalidateProfileCache`를 호출하여 캐시를 초기화한다.

### 트랙 리스트 아이템 컴포넌트

트랙 리스트에서 각 트랙을 표시하는 아이템 컴포넌트. 왼편에 트랙 앨범 커버 표시. 우측에 수직으로 트랙명, 아티스트명 표시. 필요에 따라 "Add" 텍스트 버튼 또는 "Added" 텍스트 표시.

### 랜딩 페이지

메인 페이지 (`/`). 로그인한 유저는 프로필 페이지로 리다이렉트하고, 비로그인 유저에게는 서비스 소개를 표시한다.

- 로그인 유저: 프로필이 있으면 `/u/{handle}`로, 없으면 `/auth/onboarding`으로 리다이렉트
- 비로그인 유저:
  - 상단 헤더
    - left: none
    - right: none
  - 중앙 콘텐츠
    - 서비스명 "Shareplay" (큰 텍스트)
    - 설명: "나만의 플레이리스트를 만들고, 친구들과 공유하세요."
    - 3단계 소개 (곡 검색/추가, 커버플로우 감상, 링크 공유)
    - "시작하기" 버튼 → `/auth/login` 으로 이동
    - 개인정보처리방침 링크 (`/privacy`), 서비스 약관 링크 (`/terms`)

### 유저 인증 페이지

supabase auth 를 활용하여 Google 기반 로그인 기능을 구현한다.

- 상단 헤더
  - left: none
  - right: none
- 중앙 콘텐츠
  - 헤더
    - title: "Sign In"
    - description: "Continue to add “No Pole” to your Shareplay"
  - 로그인 폼
    - Google 로그인 버튼
    - helper text: "By clicking continue, you agree to our Terms of Service and Privacy Policy."

### 프로필 페이지

유저가 설정한 플레이리스트를 보여준다.

- 상단 헤더
  - left: muted
  - right: profile
- 중앙 콘텐츠
  - 헤더
    - title: "{user handle}"
    - description: "{user message}"
    - 우측 "Share" 버튼 (내 페이지인 경우에만 표시)
      - 클릭 시 navigator.share() API 를 활용하여 현재 페이지를 공유한다.
  - 플레이리스트 (coverflow 컴포넌트 활용)
    - 좌우로 스와이프하여 트랙 선택
  - 트랙 정보 표시 오버레이
    - blur black 백그라운드
    - 트랙명, 아티스트명 표시
    - 재생/일시정지 버튼
      - 클릭 시 itunes search api 를 활용하여 해당 트랙의 previewUrl 을 재생한다.
    - "Add to my Shareplay" 텍스트 버튼
      - 클릭 시 해당 트랙이 유저의 플레이리스트에 추가되고, "Added to Shareplay" 텍스트로 변경
    - "Play on Apple Music" 텍스트 버튼
      - 클릭 시 itunes search api 를 활용하여 해당 트랙의 trackViewUrl 로 이동한다.

### 온보딩 페이지

최초 로그인 시, 유저에게 프로필 정보를 입력받는다.
`/auth/onboarding` 에서 접근.

- 중앙 콘텐츠
  - 헤더
    - title: "Welcome to Shareplay"
    - description: "Set up your profile to get started"
  - 프로필 설정 폼
    - 프로필 사진 업로드 (선택)
    - handle 입력 (필수, unique 검증)
    - display name 입력 (필수)
    - message 입력 (선택)
  - "Get Started" primary 버튼
    - 클릭 시 profiles 테이블에 INSERT 후 `/my` 로 이동

### 유저 프로필 페이지

유저가 자신의 프로필과 플레이리스트를 관리한다.
로그인한 유저만 접근할 수 있다. (`/my`)

- 상단 헤더
  - left: muted
  - right: profile
- 중앙 콘텐츠
  - 헤더
    - title: "{user handle}"
    - description: "{user message}"
    - 우측 "Edit Profile" 텍스트 버튼
      - 클릭 시 프로필 정보 편집 모달 오픈
      - user handle 과 user message 를 수정할 수 있다.
  - 플레이리스트
    - 트랙 리스트 아이템의 리스트
      - 드래그 앤 드랍으로 트랙 순서 변경 (use-gesture 사용)
      - 좌측으로 스와이프하여 트랙 삭제 버튼 표시 (모바일 전용, md 이상에서는 비활성화)
    - 하단에 "Find more" 텍스트 버튼
      - 선택 시 곡 검색 페이지로 이동

### 곡 검색 페이지

유저가 곡을 검색하여 자신의 플레이리스트에 추가한다.
로그인한 유저만 접근할 수 있다.

- 상단 헤더
  - left: muted
  - right: profile
- 중앙 콘텐츠
  - 헤더
    - title: "Let's find something"
  - 검색 창
    - debounce 적용하여 입력값이 변경된 후 500ms 이후에 검색이 실행되도록 한다.
    - placeholder: "Search for songs"
  - 검색 결과 리스트
    - 트랙 리스트 아이템의 리스트
      - "Add" 텍스트 버튼
        - 클릭 시 해당 트랙이 유저의 플레이리스트에 추가되고, "Added" 텍스트로 변경, sonner 토스트 팝업 표시 (undo 기능 포함)
- 하단 고정
  - "Done" primary 버튼
    - 클릭 시 프로필 페이지로 이동
  - "Back" 텍스트 버튼
    - 클릭 시 변경사항 없이 프로필 페이지로 이동
