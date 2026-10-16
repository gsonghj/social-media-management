"use server"

import { redirect } from "next/navigation"

import { createSession, deleteSession } from "@/lib/server/session"
import { getUserById } from "@/lib/users"

export async function signIn(formData: FormData) {
  const userId = formData.get("userId")
  const user = typeof userId === "string" ? getUserById(userId) : null
  if (!user) redirect("/signin")

  await createSession(user.id)
  redirect("/posts")
}

export async function signOut() {
  await deleteSession()
  redirect("/signin")
}
