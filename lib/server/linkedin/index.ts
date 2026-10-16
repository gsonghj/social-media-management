import { env } from "@/lib/server/env"

import { client } from "./client"
import type { LinkedInClient } from "./types"

function createClient(): LinkedInClient {
  if (env.LINKEDIN_AUTHOR_TYPE === "organization") {
    throw new Error("아직 지원하지 않는 타입입니다.")
  }

  return client
}

export const linkedin = createClient()
