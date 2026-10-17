import { cookies } from "next/headers"
import { cache } from "react"

import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/constants"
import { sign, verify } from "@/lib/server/crypto"
import { env } from "@/lib/server/env"
import { getUserById, type UserId } from "@/lib/users"

type Session = {
  userId: UserId
  exp: number
}

/** 서명된 세션 쿠키를 발급한다. */
export async function createSession(userId: UserId) {
  const payload: Session = {
    userId,
    exp: Date.now() + SESSION_COOKIE_OPTIONS.maxAge * 1000,
  }
  const token = sign(payload, env.SESSION_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS)
}

/** 세션 쿠키를 삭제한다. */
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/** 세션 쿠키를 검증해 현재 사용자를 반환한다. */
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = verify<Session>(token, env.SESSION_SECRET)
  if (
    !payload ||
    typeof payload.userId !== "string" ||
    !Number.isFinite(payload.exp)
  )
    return null

  return getUserById(payload.userId)
})
