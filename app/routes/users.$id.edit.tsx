import type { Route } from "./+types/users.$id.edit";
import { redirect, Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [{ title: "编辑用户" }, { name: "description", content: "编辑用户信息" }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const db = context.db;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(params.id)))
    .get();

  if (!user) {
    throw new Response("用户不存在", { status: 404 });
  }

  return { user };
}

export async function action({ context, request, params }: Route.ActionArgs) {
  const db = context.db;
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  if (!name || !email) {
    return { error: "请填写所有字段" };
  }

  try {
    await db
      .update(users)
      .set({
        name: String(name),
        email: String(email),
      })
      .where(eq(users.id, Number(params.id)));
    return redirect("/users");
  } catch (error) {
    return { error: "更新失败，邮箱可能已存在" };
  }
}

export default function EditUserPage({ actionData }: Route.ComponentProps) {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/users">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>

      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>编辑用户</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                {actionData.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                placeholder="请输入姓名"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit">保存</Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/users">取消</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
