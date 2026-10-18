import {
  Bookmark,
  ExternalLink,
  Eye,
  FileText,
  MessageCircle,
  Repeat2,
  ThumbsUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const VISIBILITY_LABELS = {
  PUBLIC: "전체",
  CONNECTIONS: "1촌만",
} as const

export function PostsTable({
  posts,
}: {
  posts: {
    postId: string
    content: string
    visibility: keyof typeof VISIBILITY_LABELS
    createdAt: Date
  }[]
}) {
  if (posts.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>게시물이 없습니다</EmptyTitle>
          <EmptyDescription>
            이 앱에서 올린 게시물만 표시됩니다
            <br />
            LinkedIn에서 직접 올린 게시물은 표시되지 않습니다
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">게시일</TableHead>
              <TableHead className="px-4">내용</TableHead>
              <TableHead className="px-4 text-center">공개 범위</TableHead>
              <TableHead className="px-4 text-center">
                <ThumbsUp className="size-4 shrink-0" />
                <span className="sr-only">반응 수</span>
              </TableHead>
              <TableHead className="px-4 text-center">
                <MessageCircle className="size-4 shrink-0" />
                <span className="sr-only">댓글 수</span>
              </TableHead>
              <TableHead className="px-4 text-center">
                <Repeat2 className="size-4 shrink-0" />
                <span className="sr-only">재공유 수</span>
              </TableHead>
              <TableHead className="px-4 text-center">
                <Bookmark className="size-4 shrink-0" />
                <span className="sr-only">저장 수</span>
              </TableHead>
              <TableHead className="px-4 text-center">
                <Eye className="size-4 shrink-0" />
                <span className="sr-only">노출 수</span>
              </TableHead>
              <TableHead className="px-4 text-center">
                <span className="sr-only">LinkedIn에서 보기</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.postId}>
                <TableCell className="p-4 text-muted-foreground">
                  <time dateTime={post.createdAt.toISOString()}>
                    {post.createdAt.toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                    })}
                  </time>
                </TableCell>
                <TableCell className="w-full max-w-0 min-w-64 p-4">
                  <p className="line-clamp-2 wrap-anywhere whitespace-pre-wrap">
                    {post.content}
                  </p>
                </TableCell>
                <TableCell className="p-4 text-center">
                  <Badge variant="secondary">
                    {VISIBILITY_LABELS[post.visibility]}
                  </Badge>
                </TableCell>
                <TableCell className="p-4 text-center">0</TableCell>
                <TableCell className="p-4 text-center">0</TableCell>
                <TableCell className="p-4 text-center">0</TableCell>
                <TableCell className="p-4 text-center">0</TableCell>
                <TableCell className="p-4 text-center">0</TableCell>
                <TableCell className="p-4 text-center">
                  <a
                    href={`https://www.linkedin.com/feed/update/${post.postId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn에서 보기"
                    className={buttonVariants({
                      variant: "link",
                      size: "icon",
                    })}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        LinkedIn에서 직접 올린 게시물은 표시되지 않습니다
      </p>
    </>
  )
}
