import { env } from "@/lib/server/env"

import {
  type LinkedInClient,
  LinkedInError,
  profileSchema,
  SCOPE,
  tokenSchema,
} from "./types"

export const client: LinkedInClient = {
  buildAuthUrl(state) {
    const url = new URL(`${env.LINKEDIN_OAUTH_BASE_URL}/authorization`)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("client_id", env.LINKEDIN_CLIENT_ID)
    url.searchParams.set("redirect_uri", env.LINKEDIN_REDIRECT_URI)
    url.searchParams.set("state", state)
    url.searchParams.set("scope", SCOPE)
    return url.toString()
  },

  async exchangeCode(code) {
    const response = await fetch(`${env.LINKEDIN_OAUTH_BASE_URL}/accessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: env.LINKEDIN_CLIENT_ID,
        client_secret: env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: env.LINKEDIN_REDIRECT_URI,
      }),
    })
    if (!response.ok)
      throw new LinkedInError("인증 코드 <> 토큰 교환", response.status)

    const token = tokenSchema.parse(await response.json())
    return {
      accessToken: token.access_token,
      expiresIn: token.expires_in,
      scope: token.scope,
    }
  },

  async getProfile(accessToken) {
    const response = await fetch(env.LINKEDIN_USERINFO_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) throw new LinkedInError("프로필 조회", response.status)

    const profile = profileSchema.parse(await response.json())
    return {
      sub: profile.sub,
      name: profile.name,
      picture: profile.picture,
      email: profile.email,
    }
  },
}
