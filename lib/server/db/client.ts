import { type Db, MongoClient } from "mongodb"

import { env } from "@/lib/server/env"

// 개발 중 핫 리로드로 연결이 중복 생성되지 않도록 재사용 가능한 클라이언트 연결 Promise를 생성한다.
const mongoGlobal = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

function getClient(): Promise<MongoClient> {
  if (!mongoGlobal._mongoClientPromise) {
    const client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5초
    })

    mongoGlobal._mongoClientPromise = client
      .connect()
      .catch(async (error: unknown) => {
        // 실패한 Promise를 제거해 다음 요청에서 재연결 가능하게 한다.
        delete mongoGlobal._mongoClientPromise
        await client.close().catch(() => undefined)
        throw error
      })
  }

  return mongoGlobal._mongoClientPromise
}

/** const db = await getDb() */
export async function getDb(): Promise<Db> {
  const client = await getClient()
  return client.db(env.MONGODB_DB)
}
