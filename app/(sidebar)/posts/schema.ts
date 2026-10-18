import { z } from "zod"

/** LinkedIn 게시물 본문의 최대 글자 수 */
export const POST_CONTENT_MAX_LENGTH = 3000

export const postSchema = z.object({
  content: z.string().trim().min(1).max(POST_CONTENT_MAX_LENGTH),
  visibility: z.enum(["PUBLIC", "CONNECTIONS"]),
})

export type PostVisibility = z.infer<typeof postSchema>["visibility"]
