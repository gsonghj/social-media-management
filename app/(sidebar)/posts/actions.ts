"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { deleteAccountByUserId } from "@/lib/server/db/accounts"
import { getCurrentUser } from "@/lib/server/session"

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
