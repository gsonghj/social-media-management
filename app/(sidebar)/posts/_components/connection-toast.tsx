"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { toast } from "@/components/ui/toast"

const LINKEDIN_CONNECTION_RESULTS = {
  connected: {
    type: "success",
    description: "LinkedIn 계정을 연결했습니다",
  },
  access_denied: {
    type: "info",
    description: "LinkedIn 계정 연결을 취소했습니다",
  },
  invalid_callback: {
    type: "error",
    description: "잠시 후 다시 시도해주세요",
  },
  invalid_state: {
    type: "error",
    description: "잠시 후 다시 시도해주세요",
  },
  connection_failed: {
    type: "error",
    description: "잠시 후 다시 시도해주세요",
  },
} as const

export function ConnectionToast({ result }: { result?: string | string[] }) {
  const router = useRouter()
  const message = Object.entries(LINKEDIN_CONNECTION_RESULTS).find(
    ([key]) => key === result
  )?.[1]

  useEffect(() => {
    if (result !== undefined) {
      if (message) toast.add(message)
      router.replace("/posts")
    }
  }, [result, message, router])

  return null
}
