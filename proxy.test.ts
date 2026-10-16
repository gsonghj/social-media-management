// @vitest-environment node
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server"
import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"

import { SESSION_COOKIE } from "@/lib/constants"

import { config, proxy } from "./proxy"

const ORIGIN = "http://localhost:3000"

describe("프록시 테스트", () => {
  it("세션 쿠키가 없으면 /signin으로 이동한다", () => {
    const response = proxy(new NextRequest(`${ORIGIN}/posts`))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(`${ORIGIN}/signin`)
  })

  it("세션 쿠키가 있으면 요청을 통과시킨다", () => {
    const response = proxy(
      new NextRequest(`${ORIGIN}/posts`, {
        headers: { cookie: `${SESSION_COOKIE}=token` }, // 쿠키 존재 여부만 확인
      })
    )

    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("세션 쿠키가 없어도 /signin은 통과시킨다", () => {
    const response = proxy(new NextRequest(`${ORIGIN}/signin`))

    expect(response.headers.get("x-middleware-next")).toBe("1")
  })
})

describe("프록시 matcher 테스트", () => {
  const matches = (path: string) =>
    unstable_doesMiddlewareMatch({ config, url: `${ORIGIN}${path}` })

  it.each(["/", "/signin", "/posts"])("%s에서는 프록시가 적용된다", (path) => {
    expect(matches(path)).toBe(true)
  })

  it.each(["/_next/static/chunks/app.js", "/_next/image", "/favicon.ico"])(
    "%s에서는 프록시가 적용되지 않는다",
    (path) => {
      expect(matches(path)).toBe(false)
    }
  )
})
