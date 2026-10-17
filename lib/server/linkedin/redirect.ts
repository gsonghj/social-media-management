import { NextResponse } from "next/server"

import { env } from "@/lib/server/env"

/** 지정한 주소로 303 이동한다. 응답 캐시와 Referer를 통한 인증 URL 노출을 막는다. */
export function redirectTo(target: string) {
  const url = new URL(target, new URL(env.LINKEDIN_REDIRECT_URI).origin)

  return NextResponse.redirect(url, {
    status: 303,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  })
}
