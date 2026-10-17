import { redirect } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { getAccountByUserId } from "@/lib/server/db/accounts"
import { getCurrentUser } from "@/lib/server/session"

import { ConnectionToast } from "./_components/connection-toast"
import { LinkedInConnection } from "./_components/linkedin-connection"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ linkedin?: string | string[] }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const [{ linkedin }, account] = await Promise.all([
    searchParams,
    getAccountByUserId(user.id),
  ])

  return (
    <>
      <ConnectionToast result={linkedin} />

      <PageHeader title="Posts">
        <LinkedInConnection account={account ?? undefined} />
      </PageHeader>

      <div>Posts Page</div>
    </>
  )
}
