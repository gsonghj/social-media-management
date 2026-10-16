// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import { env } from "@/lib/server/env"

vi.mock("@/lib/server/env", () => ({
  env: { LINKEDIN_AUTHOR_TYPE: "person" },
}))

beforeEach(() => {
  env.LINKEDIN_AUTHOR_TYPE = "person"
  vi.resetModules()
})

describe("클라이언트 선택 테스트", () => {
  it("person 타입이면 클라이언트를 반환한다", async () => {
    const { linkedin } = await import("./index")
    const { client } = await import("./client")

    expect(linkedin).toBe(client)
  })

  it("organization 타입이면 에러를 던진다", async () => {
    env.LINKEDIN_AUTHOR_TYPE = "organization"

    await expect(import("./index")).rejects.toThrow(
      "아직 지원하지 않는 타입입니다."
    )
  })
})
