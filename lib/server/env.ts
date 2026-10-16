import { z } from "zod"

const schema = z
  .object({
    MONGODB_URI: z.string().min(1),
    MONGODB_DB: z.string().min(1),

    LINKEDIN_AUTHOR_TYPE: z.enum(["person", "organization"]),
    LINKEDIN_CLIENT_ID: z.string().min(1),
    LINKEDIN_CLIENT_SECRET: z.string().min(1),
    LINKEDIN_REDIRECT_URI: z.url(),

    LINKEDIN_OAUTH_BASE_URL: z.url(),
    LINKEDIN_USERINFO_URL: z.url(),
    LINKEDIN_OIDC_DISCOVERY_URL: z.url(),
    LINKEDIN_API_BASE_URL: z.url(),
    LINKEDIN_API_VERSION: z
      .string()
      .regex(/^\d{6}$/, "YYYYMM 형식이어야 합니다."),
    LINKEDIN_ORGANIZATION_ID: z.string().optional(),

    OAUTH_STATE_SECRET: z.string().min(44),
    SESSION_SECRET: z.string().min(44),
    TOKEN_ENCRYPTION_KEY: z
      .string()
      .refine(
        (v) => Buffer.from(v, "base64").length === 32,
        "base64로 인코딩된 32바이트 키여야 합니다."
      ),

    APP_MOCK: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  })
  .refine(
    (v) =>
      v.LINKEDIN_AUTHOR_TYPE !== "organization" || !!v.LINKEDIN_ORGANIZATION_ID,
    {
      path: ["LINKEDIN_ORGANIZATION_ID"],
      message: "organization 타입일 때는 필수입니다.",
    }
  )

// 서버 시작 시 환경변수를 검증해 잘못된 설정으로 실행되는 것을 방지한다.
const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(
    `환경변수 설정이 올바르지 않습니다.\n${z.prettifyError(parsed.error)}`
  )
}

export const env = parsed.data
