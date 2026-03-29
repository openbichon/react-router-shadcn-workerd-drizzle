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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState, useRef } from "react";

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

  if (intent === "update") {
    const id = formData.get("id");
    const name = formData.get("name");
    const email = formData.get("email");
    if (id && name && email) {
      await db
        .update(users)
        .set({
          name: String(name),
          email: String(email),
        })
        .where(eq(users.id, Number(id)));
    }
    return { success: true };
  }

  return { success: false };
}

export default function UsersPage({ loaderData, actionData }: Route.ComponentProps) {
  const [editingUser, setEditingUser] = useState<typeof users.$inferSelect | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const handleEdit = (user: typeof users.$inferSelect) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground">共 {loaderData.users.length} 位用户</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建用户
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>新建用户</DialogTitle>
            </DialogHeader>
            <form ref={createFormRef} method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div className="space-y-2">
                <Label htmlFor="create-name">姓名</Label>
                <Input id="create-name" name="name" placeholder="请输入姓名" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">邮箱</Label>
                <Input
                  id="create-email"
                  name="email"
                  type="email"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">创建</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleString("zh-CN") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={user.id} />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="submit"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            if (!confirm("确定要删除这个用户吗？")) {
                              e.preventDefault();
                            }
                          }}
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  创建第一个用户
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>新建用户</DialogTitle>
                </DialogHeader>
                <form ref={createFormRef} method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="create" />
                  <div className="space-y-2">
                    <Label htmlFor="create-name">姓名</Label>
                    <Input id="create-name" name="name" placeholder="请输入姓名" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email">邮箱</Label>
                    <Input
                      id="create-email"
                      name="email"
                      type="email"
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose>
                      <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button type="submit">创建</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* 编辑用户模态框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form ref={editFormRef} method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={editingUser.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingUser.name}
                  placeholder="请输入姓名"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">邮箱</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  placeholder="请输入邮箱"
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
