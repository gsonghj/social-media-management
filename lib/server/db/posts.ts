import { ObjectId } from "mongodb"

import { UserId } from "@/lib/users"

import { getDb } from "./client"

export type LinkedInPostDoc = {
  _id: ObjectId
  userId: UserId
  accountId: ObjectId
  postId: string
  content: string
  visibility: "PUBLIC" | "CONNECTIONS"
  createdAt: Date
}

// 인덱스는 프로세스당 한 번만 생성한다. 실패하면 다음 호출에서 재시도한다.
let indexesReady: Promise<string> | undefined

/** const posts = await getPosts() */
export async function getPosts() {
  const collection = (await getDb()).collection<LinkedInPostDoc>(
    "linkedin_posts"
  )

  // 인덱스 생성
  indexesReady ??= collection
    .createIndex({ userId: 1, createdAt: -1 }) // 사용자별 최신순 조회
    .catch((error: unknown) => {
      indexesReady = undefined
      throw error
    })
  await indexesReady

  return collection
}

/** 사용자가 올린 게시물을 최신순으로 조회한다. */
export async function listPostsByUserId(userId: UserId, limit = 20) {
  const posts = await getPosts()
  return posts.find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray()
}

/** 게시물을 저장한다. */
export async function insertPost(post: Omit<LinkedInPostDoc, "_id">) {
  const posts = await getPosts()
  const doc: LinkedInPostDoc = { ...post, _id: new ObjectId() }
  await posts.insertOne(doc)
  return doc
}
