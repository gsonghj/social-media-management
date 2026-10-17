import { randomBytes, timingSafeEqual } from "node:crypto"

import { OAUTH_STATE_COOKIE_OPTIONS } from "@/lib/constants"
import { sign, verify } from "@/lib/server/crypto"
import { env } from "@/lib/server/env"
import type { UserId } from "@/lib/users"

type OAuthState = {
  userId: UserId
  state: string
  exp: number
}

/** 임의의 state와 사용자·만료 정보를 담은 서명된 쿠키 값을 만든다. */
export function createOAuthState(userId: UserId) {
  const state = randomBytes(32).toString("base64url") // URL 쿼리로 전달하므로 base64 X base64url O
  const payload: OAuthState = {
    userId,
    state,
    exp: Date.now() + OAUTH_STATE_COOKIE_OPTIONS.maxAge * 1000,
  }
  return { state, cookie: sign(payload, env.OAUTH_STATE_SECRET) }
}

/** 쿠키의 서명·만료·사용자를 확인하고 콜백 state와 비교한다. */
export function verifyOAuthState(
  state: string,
  cookie: string | undefined,
  userId: UserId
) {
  if (!cookie) return false

  const payload = verify<OAuthState>(cookie, env.OAUTH_STATE_SECRET)
  if (
    !payload ||
    payload.userId !== userId ||
    typeof payload.state !== "string" ||
    !Number.isFinite(payload.exp)
  )
    return false

  const expected = Buffer.from(payload.state)
  const actual = Buffer.from(state)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
