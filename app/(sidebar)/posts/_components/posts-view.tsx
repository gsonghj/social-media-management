import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { getAccountByUserId } from "@/lib/server/db/accounts"
import { listPostsByUserId } from "@/lib/server/db/posts"
import { getCurrentUser } from "@/lib/server/session"
import { cn } from "@/lib/utils"

import { ConnectionToast } from "./connection-toast"
import { LinkedInConnection } from "./linkedin-connection"
import { PostsTable } from "./posts-table"

export async function PostsView({
  linkedin,
}: {
  linkedin?: string | string[]
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")

  const [account, posts] = await Promise.all([
    getAccountByUserId(user.id),
    listPostsByUserId(user.id),
  ])
  const connected = !!account && account.expiresAt > new Date()

  return (
    <>
      <ConnectionToast result={linkedin} />

      <PageHeader title="Posts">
        <LinkedInConnection account={connected ? account : undefined} />
      </PageHeader>

      <section className="flex flex-col gap-4 p-4">
        <div className="flex items-center">
          {connected ? (
            <Link
              href="/posts/compose"
              className={cn(buttonVariants({ size: "lg" }), "ml-auto")}
            >
              <Plus data-icon="inline-start" />
              게시물 올리기
            </Link>
          ) : (
            <Button disabled size="lg" className="ml-auto">
              <Plus data-icon="inline-start" />
              게시물 올리기
            </Button>
          )}
        </div>

        <PostsTable posts={posts} />
      </section>
    </>
  )
}
