import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getCurrentUser } from "@/lib/server/session"
import { SEED_USERS } from "@/lib/users"

import { signIn } from "./actions"

export default async function Page() {
  const user = await getCurrentUser()
  if (user) redirect("/posts")

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Social Media Management</CardTitle>
          <CardDescription>로그인할 계정을 선택하세요.</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="signin-form" action={signIn}>
            {/* 선택한 값을 서버에서 formData.get("userId")로 읽는다. */}
            <RadioGroup name="userId" required>
              {SEED_USERS.map((user) => (
                <FieldLabel key={user.id} htmlFor={user.id}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{user.name}</FieldTitle>
                      <FieldDescription>{user.email}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={user.id} id={user.id} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </form>
        </CardContent>

        <CardFooter>
          <Button type="submit" form="signin-form" size="lg" className="w-full">
            로그인
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
