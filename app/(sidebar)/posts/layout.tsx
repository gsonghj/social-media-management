export default function PostsLayout({
  modal,
  children,
}: Readonly<{
  modal: React.ReactNode
  children: React.ReactNode
}>) {
  return (
    <>
      {modal}
      {children}
    </>
  )
}
