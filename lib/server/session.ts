import { cookies } from "next/headers"
import { cache } from "react"

import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants"
import { sign, verify } from "@/lib/server/crypto"
import { env } from "@/lib/server/env"
import { getUserById, type UserId } from "@/lib/users"

/** 서명된 세션 쿠키를 발급한다. */
export async function createSession(userId: UserId) {
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const token = sign({ userId, exp }, env.SESSION_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
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

  const payload = verify<{ userId: string; exp: number }>(
    token,
    env.SESSION_SECRET
  )
  if (!payload || typeof payload.userId !== "string") return null

  return getUserById(payload.userId)
})
