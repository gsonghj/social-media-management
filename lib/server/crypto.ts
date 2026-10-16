import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

import { env } from "@/lib/server/env"

const IV_LENGTH = 12
const TAG_LENGTH = 16

/** HMAC-SHA256 서명을 생성한다. */
function hmac(data: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(data).digest()
}

/** payload를 서명된 토큰으로 변환한다. */
export function sign(payload: object, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = hmac(body, secret).toString("base64url")

  return `${body}.${signature}`
}

/** 토큰의 서명과 만료 시간을 검증하고 payload를 반환한다. */
export function verify<T extends { exp: number }>(
  token: string,
  secret: string
): T | null {
  const parts = token.split(".")
  if (parts.length !== 2) return null

  const [body, signature] = parts
  if (!body || !signature) return null

  // 서명 확인
  const expected = hmac(body, secret)
  const actual = Buffer.from(signature, "base64url")
  if (actual.length !== expected.length) return null
  if (!timingSafeEqual(actual, expected)) return null

  // body 파싱
  let payload: T
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString())
  } catch {
    return null
  }

  // 만료 확인
  if (payload.exp < Date.now()) return null

  return payload
}

function key(): Buffer {
  return Buffer.from(env.TOKEN_ENCRYPTION_KEY, "base64")
}

/** 평문을 암호화한다. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv("aes-256-gcm", key(), iv, {
    authTagLength: TAG_LENGTH,
  })
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return [iv, tag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".")
}

/** 암호문을 복호화한다. */
export function decrypt(ciphertext: string): string | null {
  const parts = ciphertext.split(".")
  if (parts.length !== 3) return null

  const [iv, tag, encrypted] = parts.map((part) =>
    Buffer.from(part, "base64url")
  )
  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) return null

  const decipher = createDecipheriv("aes-256-gcm", key(), iv, {
    authTagLength: TAG_LENGTH,
  })
  decipher.setAuthTag(tag)

  try {
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8")
  } catch {
    // GCM 인증 실패(변조)는 final()에서 throw되므로 null로 변환한다.
    return null
  }
}
