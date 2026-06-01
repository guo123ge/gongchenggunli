"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";

export function ArchiveUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("Material test report");
  const [category, setCategory] = useState("Test records");
  const [tags, setTags] = useState("material,test,structure");
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
      toast.error(body.error ?? "Archive submission failed.");
      return;
    }
    toast.success("Archive submitted.");
    startTransition(() => router.push("/archive"));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Archive upload</CardTitle>
            <CardDescription>Record category, tags, version, and evidence files.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="archive-title">Archive title</Label>
            <Input id="archive-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="archive-category">Category</Label>
            <Input id="archive-category" value={category} onChange={(event) => setCategory(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="archive-tags">Tags</Label>
            <Input id="archive-tags" value={tags} onChange={(event) => setTags(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="archive-version">Version</Label>
            <Input id="archive-version" value={version} onChange={(event) => setVersion(event.target.value)} />
          </div>
        </div>
      </Card>
      <ImageUpload />
      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending || !title.trim()}>
          {isPending ? "Submitting..." : "Submit archive"}
        </Button>
      </div>
    </div>
  );
}
