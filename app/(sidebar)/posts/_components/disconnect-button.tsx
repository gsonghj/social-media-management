"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

import { disconnectLinkedIn } from "../actions"

export function DisconnectButton() {
  const [isPending, startTransition] = useTransition()

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectLinkedIn()

      toast.add(
        result.success
          ? {
              type: "success",
              description: "LinkedIn 연결을 해제했습니다",
            }
          : {
              type: "error",
              description: "잠시 후 다시 시도해주세요",
            }
      )
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={handleDisconnect}
    >
      {isPending && <Spinner data-icon="inline-start" />} 연결 해제
    </Button>
  )
}
