import { Link2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

export function LinkedInConnection({
  account,
}: {
  account?: {
    sub: string
    name: string
    picture?: string
    email?: string
    expiresAt: Date
  }
}) {
  return (
    <>
      {!!account && account.expiresAt > new Date() ? (
        <>
          {/* <Avatar size="sm">
            <AvatarImage src={account.picture || undefined} alt="" />
            <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
          </Avatar> */}

          <Link2 className="size-4 shrink-0" />

          <p className="truncate text-sm">
            {account.email
              ? `${account.name} (${account.email})`
              : account.name}
          </p>

          {/* TODO: 연결 해제 구현 */}
          <Button type="submit" variant="outline" disabled>
            연결 해제
          </Button>
        </>
      ) : (
        <a href="/api/linkedin/connect" className={buttonVariants()}>
          계정 연결
        </a>
      )}
    </>
  )
}
