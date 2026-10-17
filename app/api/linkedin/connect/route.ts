import { OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS } from "@/lib/constants"
import { linkedin } from "@/lib/server/linkedin"
import { redirectTo } from "@/lib/server/linkedin/redirect"
import { createOAuthState } from "@/lib/server/linkedin/state"
import { getCurrentUser } from "@/lib/server/session"

/** 로그인한 사용자를 LinkedIn 인증 화면으로 보낸다. */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return redirectTo("/signin")
  }

  const { state, cookie } = createOAuthState(user.id)
  const response = redirectTo(linkedin.buildAuthUrl(state))
  response.cookies.set(OAUTH_STATE_COOKIE, cookie, OAUTH_STATE_COOKIE_OPTIONS)

  return response
}
