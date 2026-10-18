import { redirect } from "next/navigation"

import { getAccountByUserId } from "@/lib/server/db/accounts"
import { getCurrentUser } from "@/lib/server/session"

import { ComposeModal } from "./compose-modal"

export async function PostComposer({
  intercepted = false,
}: {
  intercepted?: boolean
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const account = await getAccountByUserId(user.id)
  const connected = !!account && account.expiresAt > new Date()
  if (!connected) redirect("/posts")

  return (
    <ComposeModal
      intercepted={intercepted}
      linkedinProfile={{ name: account.name, picture: account.picture }}
    />
  )
}
