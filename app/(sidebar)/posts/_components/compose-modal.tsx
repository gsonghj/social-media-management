"use client"

import { useRouter } from "next/navigation"
import { type SubmitEvent, useId, useState, useTransition } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

import { createPost } from "../actions"
import { POST_CONTENT_MAX_LENGTH, type PostVisibility } from "../schema"

const items = [
  { label: "전체 공개", value: "PUBLIC" },
  { label: "1촌 공개", value: "CONNECTIONS" },
]

export function ComposeModal({
  intercepted = false,
  linkedinProfile,
}: {
  intercepted?: boolean
  linkedinProfile: { name: string; picture?: string }
}) {
  const router = useRouter()
  const formId = useId()
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC")
  const [isPending, startTransition] = useTransition()

  const isSubmittable =
    content.trim().length > 0 &&
    content.trim().length <= POST_CONTENT_MAX_LENGTH &&
    !isPending

  function close() {
    if (intercepted) router.back()
    else router.replace("/posts")
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isSubmittable) return

    const formData = new FormData()
    formData.set("content", content)
    formData.set("visibility", visibility)

    startTransition(async () => {
      const result = await createPost(formData)

      if (result.success) {
        close()
        toast.add({
          type: "success",
          description: "게시물을 올렸습니다",
        })
      } else {
        toast.add({
          type: "error",
          description: result.message,
        })
      }
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && close()}>
      <DialogContent
        showCloseButton={!isPending}
        className="h-full max-h-full max-w-full grid-rows-[auto_minmax(0,1fr)_auto] rounded-none sm:max-w-full md:max-h-[80vh] md:max-w-2xl md:rounded-[min(var(--radius-4xl),24px)] xl:max-w-3xl"
      >
        <DialogHeader className="flex-row items-center gap-2">
          <Avatar>
            <AvatarImage src={linkedinProfile.picture || undefined} alt="" />
            <AvatarFallback>{linkedinProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <DialogTitle>{linkedinProfile.name}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0">
          <form id={formId} onSubmit={handleSubmit} className="h-full">
            <InputGroup className="h-full! border-none! ring-0!">
              <InputGroupTextarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="생각 나누기..."
                disabled={isPending}
                aria-invalid={content.trim().length > POST_CONTENT_MAX_LENGTH}
                className="field-sizing-fixed min-h-0 p-3 pb-1.5"
              />
              <InputGroupAddon align="block-end" className="p-3 pt-1.5">
                <InputGroupText
                  className={cn(
                    "ml-auto",
                    content.trim().length > POST_CONTENT_MAX_LENGTH &&
                      "text-destructive"
                  )}
                >
                  {content.trim().length} / {POST_CONTENT_MAX_LENGTH}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>

        <DialogFooter className="flex-row! justify-between!">
          {/* TODO: 임시 저장 기능 구현 */}
          <Button type="button" variant="ghost" disabled>
            임시 저장
          </Button>

          <div className="flex gap-2">
            <Select
              items={items}
              value={visibility}
              onValueChange={(value) =>
                setVisibility(
                  value === "CONNECTIONS" ? "CONNECTIONS" : "PUBLIC"
                )
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button type="submit" form={formId} disabled={!isSubmittable}>
              {isPending && <Spinner data-icon="inline-start" />} 게시하기
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
