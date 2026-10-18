import { PostsView } from "./_components/posts-view"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ linkedin?: string | string[] }>
}) {
  const { linkedin } = await searchParams

  return <PostsView linkedin={linkedin} />
}
