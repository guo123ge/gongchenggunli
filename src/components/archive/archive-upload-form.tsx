"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export function ArchiveUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("材料复试报告");
  const [category, setCategory] = useState("试验资料");
  const [tags, setTags] = useState("材料,复试,主体结构");
  const [version, setVersion] = useState("v1.0");

  async function submit() {
    const response = await fetch("/api/archives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
        version,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      toast.error(body.error ?? "档案提交失败。");
      return;
    }
    toast.success("档案已提交。");
    startTransition(() => router.push("/archive"));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>档案上传</CardTitle>
            <CardDescription>填写分类、标签、版本并上传相关资料文件，图片会同步进入资料库集中保存。</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="archive-title">档案标题</Label>
            <Input id="archive-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="archive-category">分类</Label>
            <Input id="archive-category" value={category} onChange={(event) => setCategory(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="archive-tags">标签</Label>
            <Input id="archive-tags" value={tags} onChange={(event) => setTags(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="archive-version">版本号</Label>
            <Input id="archive-version" value={version} onChange={(event) => setVersion(event.target.value)} />
          </div>
        </div>
      </Card>
      <ImageUpload module="archive" titlePrefix="档案资料照片" />
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "提交中..." : "提交档案"}
        </Button>
      </div>
    </div>
  );
}
