// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"

import { client } from "./client"
import { LinkedInError } from "./types"

vi.mock("@/lib/server/env", () => ({
  env: {
    LINKEDIN_CLIENT_ID: "client-id",
    LINKEDIN_CLIENT_SECRET: "client-secret",
    LINKEDIN_REDIRECT_URI: "http://localhost:3000/api/linkedin/callback",
    LINKEDIN_OAUTH_BASE_URL: "https://www.linkedin.com/oauth/v2",
    LINKEDIN_USERINFO_URL: "https://api.linkedin.com/v2/userinfo",
    LINKEDIN_API_BASE_URL: "https://api.linkedin.com/rest",
    LINKEDIN_API_VERSION: "202609",
  },
}))

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("인증 URL 생성 테스트", () => {
  it("인증 URL에 필수 파라미터를 담는다", () => {
    const url = new URL(client.buildAuthUrl("signed-state"))

    expect(url.origin + url.pathname).toBe(
      "https://www.linkedin.com/oauth/v2/authorization"
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: "code",
      client_id: "client-id",
      redirect_uri: "http://localhost:3000/api/linkedin/callback",
      state: "signed-state",
      scope: "openid profile email w_member_social",
    })
  })
})

describe("인증 코드 <> 토큰 교환 테스트", () => {
  it("코드를 form 방식으로 보내고 토큰을 반환한다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        access_token: "access-token",
        expires_in: 5184000,
        scope: "openid profile email",
      })
    )

    expect(await client.exchangeCode("auth-code")).toEqual({
      accessToken: "access-token",
      expiresIn: 5184000,
      scope: "openid profile email",
    })
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://www.linkedin.com/oauth/v2/accessToken",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: expect.any(URLSearchParams),
      })
    )

    const body = fetchMock.mock.calls[0][1]?.body as URLSearchParams
    expect(Object.fromEntries(body)).toEqual({
      grant_type: "authorization_code",
      code: "auth-code",
      client_id: "client-id",
      client_secret: "client-secret",
      redirect_uri: "http://localhost:3000/api/linkedin/callback",
    })
  })

  it("잘못된 형식의 응답이면 에러를 던진다", async () => {
    fetchMock.mockResolvedValue(Response.json({ access_token: "" }))

    await expect(client.exchangeCode("auth-code")).rejects.toThrow(ZodError)
  })
})

describe("프로필 조회 테스트", () => {
  it("Bearer 토큰으로 조회하고 프로필을 반환한다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        sub: "abc",
        name: "홍길동",
        picture: "https://placehold.co/120x120.png",
      })
    )

    expect(await client.getProfile("access-token")).toEqual({
      sub: "abc",
      name: "홍길동",
      picture: "https://placehold.co/120x120.png",
    })
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://api.linkedin.com/v2/userinfo",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer access-token" },
      })
    )
  })

  it("선택 필드가 없어도 프로필을 반환한다", async () => {
    fetchMock.mockResolvedValue(Response.json({ sub: "abc", name: "홍길동" }))

    expect(await client.getProfile("access-token")).toEqual({
      sub: "abc",
      name: "홍길동",
    })
  })

  it("잘못된 형식의 응답이면 에러를 던진다", async () => {
    fetchMock.mockResolvedValue(Response.json({ name: "홍길동" }))

    await expect(client.getProfile("access-token")).rejects.toThrow(ZodError)
  })

  it("401이면 재연결이 필요한 에러로 구분된다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "expired" }, { status: 401 })
    )
    const error = await client.getProfile("access-token").catch((e) => e)

    expect(error).toBeInstanceOf(LinkedInError)
    expect(error.isUnauthorized).toBe(true)
  })
})

describe("게시물 생성 테스트", () => {
  const post = {
    sub: "abc",
    content: "첫 번째 게시물입니다. #FirstPost\n반가워요! @Hello",
    visibility: "PUBLIC" as const,
  }

  it.each(["PUBLIC", "CONNECTIONS"] as const)(
    "%s 공개 범위로 게시하고 응답 헤더의 게시물 ID를 반환한다",
    async (visibility) => {
      fetchMock.mockResolvedValue(
        new Response(null, {
          status: 201,
          headers: { "x-restli-id": "urn:li:share:123" },
        })
      )

      expect(
        await client.createPost("access-token", { ...post, visibility })
      ).toEqual({ postId: "urn:li:share:123" })
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        "https://api.linkedin.com/rest/posts",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer access-token",
            "Content-Type": "application/json",
            "LinkedIn-Version": "202609",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: expect.any(String),
        })
      )
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
        author: "urn:li:person:abc",
        commentary: "첫 번째 게시물입니다. \\#FirstPost\n반가워요! \\@Hello",
        visibility,
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      })
    }
  )

  it("201 응답에 게시물 ID가 없으면 에러를 던진다", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }))

    await expect(client.createPost("access-token", post)).rejects.toThrow(Error)
  })

  it("401이면 재연결이 필요한 에러로 구분된다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "expired" }, { status: 401 })
    )
    const error = await client.createPost("access-token", post).catch((e) => e)

    expect(error).toBeInstanceOf(LinkedInError)
    expect(error.isUnauthorized).toBe(true)
  })
})
