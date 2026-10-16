export const SEED_USERS = [
  { id: "sms", name: "사원 S", email: "sohnms@example.com", avatar: "" },
  { id: "jsk", name: "사원 J", email: "jeongsk@example.com", avatar: "" },
] as const

export type User = (typeof SEED_USERS)[number]
export type UserId = (typeof SEED_USERS)[number]["id"]

export function getUserById(id: string) {
  return SEED_USERS.find((user) => user.id === id) ?? null
}
