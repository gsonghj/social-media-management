// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants"
import { sign } from "@/lib/server/crypto"
import { env } from "@/lib/server/env"

import { createSession, getCurrentUser } from "./session"

const mocks = vi.hoisted(() => ({
  cookieStore: { get: vi.fn(), set: vi.fn() },
}))

vi.mock("next/headers", () => ({
  cookies: async () => mocks.cookieStore,
}))

vi.mock("@/lib/server/env", () => ({
  env: { SESSION_SECRET: "test-session-secret" },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("세션 발급 테스트", () => {
  it("세션 쿠키를 보안 옵션과 함께 설정한다", async () => {
    await createSession("sms")

    expect(mocks.cookieStore.set).toHaveBeenCalledExactlyOnceWith(
      SESSION_COOKIE,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      })
    )
  })
})

describe("현재 사용자 조회 테스트", () => {
  it("발급한 세션으로 사용자를 조회한다", async () => {
    await createSession("jsk")
    const [, token] = mocks.cookieStore.set.mock.calls[0]
    mocks.cookieStore.get.mockReturnValue({ value: token })

    expect(await getCurrentUser()).toMatchObject({ id: "jsk" })
  })

  it("쿠키가 없으면 null을 반환한다", async () => {
    mocks.cookieStore.get.mockReturnValue(undefined)

    expect(await getCurrentUser()).toBeNull()
  })

  it("만료된 토큰은 null을 반환한다", async () => {
    const expired = sign(
      { userId: "sms", exp: Date.now() - 1 },
      env.SESSION_SECRET
    )
    mocks.cookieStore.get.mockReturnValue({ value: expired })

    expect(await getCurrentUser()).toBeNull()
  })
})
