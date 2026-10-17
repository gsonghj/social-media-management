import { ObjectId } from "mongodb"

import { UserId } from "@/lib/users"

import { getDb } from "./client"

export type LinkedInAccountDoc = {
  _id: ObjectId
  userId: UserId
  sub: string
  name: string
  picture?: string
  email?: string
  accessToken: string
  scope: string
  connectedAt: Date
  expiresAt: Date
}

// 인덱스는 프로세스당 한 번만 생성한다. 실패하면 다음 호출에서 재시도한다.
let indexesReady: Promise<string[]> | undefined

/** const accounts = await getAccounts() */
export async function getAccounts() {
  const collection = (await getDb()).collection<LinkedInAccountDoc>(
    "linkedin_accounts"
  )

  // 인덱스 생성
  indexesReady ??= collection
    .createIndexes([
      { key: { userId: 1 }, unique: true }, // 사용자당 계정 1개
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // 만료된 연결 삭제
    ])
    .catch((error: unknown) => {
      indexesReady = undefined
      throw error
    })
  await indexesReady

  return collection
}

/** 사용자의 LinkedIn 계정 연결을 조회한다. */
export async function getAccountByUserId(userId: UserId) {
  const accounts = await getAccounts()
  return accounts.findOne({ userId })
}

/** 사용자의 LinkedIn 계정 연결을 저장한다. 이미 있으면 교체하고 _id는 유지한다. */
export async function upsertAccount(account: Omit<LinkedInAccountDoc, "_id">) {
  const accounts = await getAccounts()
  await accounts.replaceOne({ userId: account.userId }, account, {
    upsert: true,
  })
}

/** 사용자의 LinkedIn 계정 연결을 삭제한다. */
export async function deleteAccountByUserId(userId: UserId) {
  const accounts = await getAccounts()
  const { deletedCount } = await accounts.deleteOne({ userId })
  return deletedCount > 0
}
