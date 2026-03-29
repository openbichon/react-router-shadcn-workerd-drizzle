import type { Route } from "./+types/users";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "用户管理" }, { name: "description", content: "管理系统用户" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.db;
  const allUsers = await db.select().from(users).orderBy(users.createdAt);
  return { users: allUsers };
}

export async function action({ context, request }: Route.ActionArgs) {
  const db = context.db;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id");
    if (id) {
      await db.delete(users).where(eq(users.id, Number(id)));
    }
    return { success: true };
  }

  if (intent === "create") {
    const name = formData.get("name");
    const email = formData.get("email");
    if (name && email) {
      await db.insert(users).values({
        name: String(name),
        email: String(email),
      });
    }
    return { success: true };
  }

  return { success: false };
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">共 {loaderData.users.length} 位用户</p>
        </div>
        <Link to="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建用户
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loaderData.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString("zh-CN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/users/${user.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={user.id} />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="submit"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {loaderData.users.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">暂无用户数据</p>
            <Link to="/users/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                创建第一个用户
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
