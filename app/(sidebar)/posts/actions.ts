"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { decrypt } from "@/lib/server/crypto"
import {
  deleteAccountByUserId,
  getAccountByUserId,
} from "@/lib/server/db/accounts"
import { insertPost } from "@/lib/server/db/posts"
import { linkedin } from "@/lib/server/linkedin"
import { LinkedInError } from "@/lib/server/linkedin/types"
import { getCurrentUser } from "@/lib/server/session"

import { postSchema } from "./schema"

/** 입력을 검증해 연결된 LinkedIn 계정에 게시하고, 게시에 성공하면 게시물을 DB에 저장한다. */
export async function createPost(
  formData: FormData
): Promise<{ success: true } | { success: false; message: string }> {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const parsed = postSchema.safeParse({
    content: formData.get("content"),
    visibility: formData.get("visibility"),
  })
  if (!parsed.success) {
    return { success: false, message: "게시물 내용을 확인해주세요" }
  }

  const account = await getAccountByUserId(user.id)
  if (!account || account.expiresAt <= new Date()) {
    return { success: false, message: "LinkedIn 계정을 연결해주세요" }
  }

  const accessToken = decrypt(account.accessToken)
  if (!accessToken) {
    return { success: false, message: "LinkedIn 계정을 연결해주세요" }
  }

  let postId: string
  try {
    const result = await linkedin.createPost(accessToken, {
      sub: account.sub,
      ...parsed.data,
    })
    postId = result.postId
  } catch (e) {
    console.error(
      "LinkedIn 게시물 생성 실패:",
      e instanceof Error ? `${e.message}` : "알 수 없는 오류"
    )

    if (e instanceof LinkedInError && e.status >= 400 && e.status < 500) {
      if (e.isUnauthorized || e.status === 403) {
        return { success: false, message: "LinkedIn 계정을 다시 연결해주세요" }
      }
      if (e.status === 429) {
        return { success: false, message: "LinkedIn 요청 한도를 초과했습니다" }
      }
      if (e.status === 400 || e.status === 422) {
        return { success: false, message: "본문과 공개 범위를 확인해주세요" }
      }
      return { success: false, message: "잠시 후 다시 시도해주세요" }
    }
    return { success: false, message: "알 수 없는 오류가 발생했습니다" }
  }

  try {
    await insertPost({
      userId: user.id,
      accountId: account._id,
      postId,
      ...parsed.data,
      createdAt: new Date(),
    })
  } catch (e) {
    console.error(
      `LinkedIn 게시물 저장 실패 (${postId}):`,
      e instanceof Error ? `${e.message}` : "알 수 없는 오류"
    )
    return {
      success: false,
      message: "LinkedIn에 게시했지만 DB에 저장하지 못했습니다",
    }
  }

  revalidatePath("/posts")
  return { success: true }
}

export async function disconnectLinkedIn() {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  try {
    await deleteAccountByUserId(user.id)
  } catch {
    return { success: false }
  }

  revalidatePath("/posts")
  return { success: true }
}
