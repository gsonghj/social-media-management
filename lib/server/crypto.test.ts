// @vitest-environment node
import { randomBytes } from "node:crypto"

import { describe, expect, it, vi } from "vitest"

import { decrypt, encrypt, sign, verify } from "./crypto"

const SECRET = "secret"

vi.mock("@/lib/server/env", () => ({
  env: { TOKEN_ENCRYPTION_KEY: randomBytes(32).toString("base64") },
}))

describe("서명 테스트", () => {
  const payload = () => ({ userId: "sms", exp: Date.now() + 60_000 })

  it("서명한 토큰을 검증하면 원래 payload를 돌려준다", () => {
    const data = payload()

    expect(verify(sign(data, SECRET), SECRET)).toEqual(data) // 새로운 객체를 반환하므로 toBe() X toEqual() O
  })

  it("위조된 토큰은 null을 반환한다", () => {
    const [, signature] = sign(payload(), SECRET).split(".")
    const forgedBody = Buffer.from(
      JSON.stringify({ userId: "jsk", exp: Date.now() + 60_000 })
    ).toString("base64url")

    expect(verify(`${forgedBody}.${signature}`, SECRET)).toBeNull()
  })

  it("만료된 토큰은 null을 반환한다", () => {
    const token = sign({ ...payload(), exp: Date.now() - 1 }, SECRET)

    expect(verify(token, SECRET)).toBeNull()
  })
})

describe("암호화 테스트", () => {
  it("암호화한 평문을 복호화하면 원문과 같다", () => {
    expect(decrypt(encrypt("hello"))).toBe("hello")
  })

  it("변조된 암호문은 null을 반환한다", () => {
    const [iv, tag, encrypted] = encrypt("hello").split(".")
    const tampered = Buffer.from(encrypted, "base64url")
    tampered[0] ^= 1

    expect(
      decrypt([iv, tag, tampered.toString("base64url")].join("."))
    ).toBeNull()
  })
})
