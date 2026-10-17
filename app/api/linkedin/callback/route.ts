import { type NextRequest } from "next/server"
import { z } from "zod"

import { OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS } from "@/lib/constants"
import { encrypt } from "@/lib/server/crypto"
import { upsertAccount } from "@/lib/server/db/accounts"
import { linkedin } from "@/lib/server/linkedin"
import { redirectTo } from "@/lib/server/linkedin/redirect"
import { verifyOAuthState } from "@/lib/server/linkedin/state"
import { getCurrentUser } from "@/lib/server/session"

// 성공하면 code, 실패하면 error
const callbackSchema = z
  .object({
    state: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    code: z.string().min(1).optional(),
    error: z.string().min(1).optional(),
  })
  .refine((value) => Boolean(value.code) !== Boolean(value.error))

/** state 쿠키를 삭제하고 연결 결과를 담아 /posts로 이동한다. */
function finish(
  result:
    | "connected"
    | "access_denied"
    | "invalid_callback"
    | "invalid_state"
    | "connection_failed"
) {
  const response = redirectTo(`/posts?linkedin=${result}`)
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    ...OAUTH_STATE_COOKIE_OPTIONS,
    maxAge: 0,
  })
  return response
}

/** LinkedIn 인증을 마치고 돌아온 사용자의 계정을 연결한다. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return redirectTo("/signin")
  }

  const params = request.nextUrl.searchParams
  if (["state", "code", "error"].some((key) => params.getAll(key).length > 1)) {
    return finish("invalid_callback")
  }

  const parsed = callbackSchema.safeParse(Object.fromEntries(params))
  if (!parsed.success) {
    return finish("invalid_callback")
  }

  const { state, code, error } = parsed.data
  const cookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value
  if (!verifyOAuthState(state, cookie, user.id)) {
    return finish("invalid_state")
  }

  if (error) {
    return finish(
      new Set([
        "user_cancelled_login",
        "user_cancelled_authorize",
        "access_denied",
      ]).has(error)
        ? "access_denied" // 사용자 취소
        : "connection_failed"
    )
  }
  if (!code) {
    return finish("invalid_callback")
  }

  try {
    const token = await linkedin.exchangeCode(code)
    const connectedAt = new Date()
    const profile = await linkedin.getProfile(token.accessToken)

    await upsertAccount({
      userId: user.id,
      sub: profile.sub,
      name: profile.name,
      // undefined는 MongoDB에 null로 저장되므로 값이 있을 때만 넣는다.
      ...(profile.picture && { picture: profile.picture }),
      ...(profile.email && { email: profile.email }),
      accessToken: encrypt(token.accessToken),
      scope: token.scope,
      connectedAt,
      expiresAt: new Date(connectedAt.getTime() + token.expiresIn * 1000),
    })
  } catch (e) {
    console.error(
      "LinkedIn 계정 연결 실패:",
      e instanceof Error ? `${e.message}` : "알 수 없는 오류"
    )
    return finish("connection_failed")
  }
  return finish("connected")
}
