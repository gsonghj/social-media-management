# Social Media Management

## 주요 기능

- LinkedIn 계정 연결 및 해제
- 텍스트 게시물 작성 및 공개 범위 선택
- 앱에서 게시한 게시물 목록 조회 및 LinkedIn 원문 이동

## 기술 스택

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, MongoDB, Zod, Vitest

## 로컬 실행

```bash
pnpm install
docker compose up -d        # MongoDB (localhost:27017)
cp .env.example .env.local  # 환경변수 설정
pnpm dev                    # http://localhost:3000
```

## 현재 범위

- 로그인은 미리 정의된 사용자 선택 방식입니다.
- 앱에서 게시한 글만 목록에 표시합니다.
