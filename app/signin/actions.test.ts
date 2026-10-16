// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SEED_USERS } from "@/lib/users"

import { signIn, signOut } from "./actions"

const mocks = vi.hoisted(() => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}))

vi.mock("@/lib/server/session", () => ({
  createSession: mocks.createSession,
  deleteSession: mocks.deleteSession,
}))

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("로그인 테스트", () => {
  it("계정을 선택하면 세션을 만들고 /posts로 이동한다", async () => {
    const { id } = SEED_USERS[0]
    const formData = new FormData()
    formData.set("userId", id)

    await expect(signIn(formData)).rejects.toThrow("REDIRECT:/posts")
    expect(mocks.createSession).toHaveBeenCalledExactlyOnceWith(id)
  })

  it.each([
    ["계정을 선택하지 않으면", undefined],
    ["존재하지 않는 계정이면", "unknown"],
  ])("%s 세션을 만들지 않고 /signin으로 이동한다", async (_, userId) => {
    const formData = new FormData()
    if (userId) {
      formData.set("userId", userId)
    }

    await expect(signIn(formData)).rejects.toThrow("REDIRECT:/signin")
    expect(mocks.createSession).not.toHaveBeenCalled()
  })
})

describe("로그아웃 테스트", () => {
  it("세션을 삭제하고 /signin으로 이동한다", async () => {
    await expect(signOut()).rejects.toThrow("REDIRECT:/signin")
    expect(mocks.deleteSession).toHaveBeenCalledOnce()
  })
})
