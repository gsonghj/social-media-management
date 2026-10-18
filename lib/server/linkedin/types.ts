import { z } from "zod"

import type { LinkedInPostDoc } from "@/lib/server/db/posts"

export const SCOPE = "openid profile email w_member_social"

export const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  scope: z.string().min(1),
})

export const profileSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  picture: z.url().optional(),
  email: z.email().optional(),
})

export type LinkedInToken = {
  accessToken: string
  expiresIn: number
  scope: string
}

export type LinkedInProfile = {
  sub: string
  name: string
  picture?: string
  email?: string
}

export type LinkedInPostInput = {
  sub: string
  content: string
  visibility: LinkedInPostDoc["visibility"]
}

export interface LinkedInClient {
  /** LinkedIn 인증 URL을 만든다. */
  buildAuthUrl(state: string): string
  /** 인증 코드를 액세스 토큰으로 교환한다. */
  exchangeCode(code: string): Promise<LinkedInToken>
  /** 액세스 토큰으로 연결된 회원의 프로필을 조회한다. */
  getProfile(accessToken: string): Promise<LinkedInProfile>
  /** 텍스트 게시물을 생성하고 게시물 ID를 반환한다. */
  createPost(
    accessToken: string,
    post: LinkedInPostInput
  ): Promise<{ postId: string }>
}

/** LinkedIn API가 실패 응답을 돌려줬을 때 던진다. 토큰과 자격 증명은 담지 않는다. */
export class LinkedInError extends Error {
  constructor(
    action: string,
    readonly status: number
  ) {
    super(`[LinkedIn] ${action} 실패 (HTTP ${status})`)
    this.name = "LinkedInError"
  }

  /** 토큰이 만료되었거나 유효하지 않아 재연결이 필요한 경우 */
  get isUnauthorized() {
    return this.status === 401
  }
}
