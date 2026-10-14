export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <main className="flex min-h-svh">{children}</main>
}
