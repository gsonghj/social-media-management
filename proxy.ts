import { type NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/lib/constants"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/signin" || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL("/signin", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
