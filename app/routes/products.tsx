import type { Route } from "./+types/products";
import { products } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Pencil, Trash2, Package, DollarSign, Box } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState, useRef } from "react";

const CATEGORIES = [
  { value: "electronics", label: "电子产品" },
  { value: "clothing", label: "服装" },
  { value: "food", label: "食品" },
  { value: "books", label: "图书" },
  { value: "home", label: "家居" },
  { value: "sports", label: "运动" },
  { value: "beauty", label: "美妆" },
  { value: "toys", label: "玩具" },
  { value: "other", label: "其他" },
];

export function meta(_args: Route.MetaArgs) {
  return [{ title: "商品管理" }, { name: "description", content: "管理系统商品" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.db;
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
  return { products: allProducts };
}

export async function action({ context, request }: Route.ActionArgs) {
  const db = context.db;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id");
    if (id) {
      await db.delete(products).where(eq(products.id, Number(id)));
    }
    return { success: true };
  }

  if (intent === "create") {
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const status = formData.get("status");

    if (name && price && stock) {
      await db.insert(products).values({
        name: String(name),
        description: description ? String(description) : null,
        price: Number(price),
        stock: Number(stock),
        category: category ? String(category) : null,
        status: status ? String(status) : "active",
      });
    }
    return { success: true };
  }

  if (intent === "update") {
    const id = formData.get("id");
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const status = formData.get("status");

    if (id && name && price && stock) {
      await db
        .update(products)
        .set({
          name: String(name),
          description: description ? String(description) : null,
          price: Number(price),
          stock: Number(stock),
          category: category ? String(category) : null,
          status: status ? String(status) : "active",
          updatedAt: new Date(),
        })
        .where(eq(products.id, Number(id)));
    }
    return { success: true };
  }

  return { success: false };
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">上架</Badge>;
    case "inactive":
      return <Badge variant="secondary">下架</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getStockBadge(stock: number) {
  if (stock <= 0) {
    return <Badge variant="destructive">缺货</Badge>;
  }
  if (stock < 10) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">库存不足</Badge>;
  }
  return (
    <Badge variant="outline" className="text-green-600 border-green-600">
      充足
    </Badge>
  );
}

function getCategoryLabel(category: string | null) {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat ? cat.label : category || "未分类";
}

export default function ProductsPage({ loaderData, actionData }: Route.ComponentProps) {
  const [editingProduct, setEditingProduct] = useState<typeof products.$inferSelect | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const handleEdit = (product: typeof products.$inferSelect) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            商品管理
          </h1>
          <p className="text-muted-foreground">共 {loaderData.products.length} 件商品</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建商品
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>新建商品</DialogTitle>
            </DialogHeader>
            <form ref={createFormRef} method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div className="space-y-2">
                <Label htmlFor="create-name">
                  商品名称 <span className="text-destructive">*</span>
                </Label>
                <Input id="create-name" name="name" placeholder="请输入商品名称" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">商品描述</Label>
                <Textarea
                  id="create-description"
                  name="description"
                  placeholder="请输入商品描述"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-price">
                    价格 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-stock">
                    库存 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="create-stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-category">分类</Label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-status">状态</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">上架</SelectItem>
                      <SelectItem value="inactive">下架</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loaderData.products.map((product) => (
          <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                {getStatusBadge(product.status)}
              </div>
              {product.category && (
                <Badge variant="outline" className="w-fit">
                  {getCategoryLabel(product.category)}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
              )}

              <div className="space-y-3 mt-auto">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    ¥{product.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">库存: {product.stock}</span>
                  </div>
                  {getStockBadge(product.stock)}
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  创建时间:{" "}
                  {product.createdAt ? new Date(product.createdAt).toLocaleString("zh-CN") : "-"}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  编辑
                </Button>
                <form method="post" className="flex-1">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={product.id} />
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    size="sm"
                    type="submit"
                    onClick={(e) => {
                      if (!confirm("确定要删除这个商品吗？")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loaderData.products.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">暂无商品数据</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建第一个商品
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新建商品</DialogTitle>
                </DialogHeader>
                <form ref={createFormRef} method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="create" />
                  <div className="space-y-2">
                    <Label htmlFor="create-name">
                      商品名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input id="create-name" name="name" placeholder="请输入商品名称" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-description">商品描述</Label>
                    <Textarea
                      id="create-description"
                      name="description"
                      placeholder="请输入商品描述"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-price">
                        价格 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="create-price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-stock">
                        库存 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="create-stock"
                        name="stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-category">分类</Label>
                      <Select name="category">
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-status">状态</Label>
                      <Select name="status" defaultValue="active">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">上架</SelectItem>
                          <SelectItem value="inactive">下架</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

      {/* 编辑商品模态框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑商品</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form ref={editFormRef} method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={editingProduct.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  商品名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingProduct.name}
                  placeholder="请输入商品名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">商品描述</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingProduct.description || ""}
                  placeholder="请输入商品描述"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">
                    价格 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct.price}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">
                    库存 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={editingProduct.stock}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">分类</Label>
                  <Select name="category" defaultValue={editingProduct.category || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">状态</Label>
                  <Select name="status" defaultValue={editingProduct.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">上架</SelectItem>
                      <SelectItem value="inactive">下架</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
