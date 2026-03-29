import { ArrowRight, Database, Shield, Sparkles, Zap, Users } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mapp - 现代化应用平台" },
    {
      name: "description",
      content: "使用 React Router v7 + Cloudflare + Drizzle 构建的高性能应用",
    },
  ];
}

export default function LandingPage() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "极速性能",
      description: "基于 Cloudflare Workers 边缘计算，全球低延迟访问",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "D1 数据库",
      description: "内置 Drizzle ORM，类型安全的数据库操作",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "用户管理",
      description: "完整的用户 CRUD 功能，支持本地 D1 数据库",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "安全可靠",
      description: "企业级安全保障，自动 HTTPS 加密传输",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="mr-1 h-3 w-3" />
          全新发布 v1.0
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          构建下一代
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Web 应用
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          使用 React Router v7、Cloudflare Workers 和 D1 数据库构建高性能、 可扩展的现代化应用程序
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/users">
            <Button size="lg">
              开始使用
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              查看源码
            </Button>
          </a>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">核心特性</h2>
          <p className="text-muted-foreground">为开发者打造的全栈解决方案</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="group transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-muted/50 p-8">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">技术栈</h2>
            <p className="text-muted-foreground">使用业界领先的技术构建</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "React Router v7",
              "Cloudflare Workers",
              "D1 Database",
              "Drizzle ORM",
              "Tailwind CSS",
              "shadcn/ui",
            ].map((tech) => (
              <Badge key={tech} variant="secondary" className="px-4 py-2 text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">准备好开始了吗？</CardTitle>
            <CardDescription>立即体验这个现代化的全栈应用模板</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/users">
              <Button size="lg" className="w-full sm:w-auto">
                进入应用
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Mapp. Built with React Router v7 + Cloudflare.</p>
        </div>
      </footer>
    </div>
  );
}
