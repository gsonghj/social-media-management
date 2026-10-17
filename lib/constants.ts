export const SESSION_COOKIE = "session"
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 8, // 8시간
  path: "/",
}

export const OAUTH_STATE_COOKIE = "linkedin_oauth_state"
export const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 10, // 10분
  path: "/api/linkedin",
}
