import { LogOut } from "lucide-react"

import { signOut } from "@/app/signin/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { User } from "@/lib/users"

export function SidebarUser({ user }: { user: User }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <form action={signOut}>
          <SidebarMenuButton type="submit" size="lg" title="로그아웃">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar || undefined} alt="" />
              <AvatarFallback className="rounded-lg">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm/tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <LogOut className="ml-auto size-4" />
          </SidebarMenuButton>
        </form>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
