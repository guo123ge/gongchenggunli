import Link from "next/link";
import { ArchiveChecker } from "@/components/archive/archive-checker";
import { FilePreview } from "@/components/archive/file-preview";
import { VersionList } from "@/components/archive/version-list";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const data = await readAppData();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Archive management</h1>
          <p className="mt-2 text-muted">Categories, full-text search, versions, and online previews.</p>
        </div>
        <Link href="/archive/new"><Button>Upload archive</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Persisted archive records</CardTitle>
            <CardDescription>Records submitted through the archive API are listed here.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {data.archives.map((item) => (
            <Link
              key={item.id}
              href={`/archive/${item.id}`}
              className="block rounded-2xl border border-border bg-panel/60 p-4 transition hover:border-brand/50"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {item.category} / {item.version} / {item.submittedBy} / {item.createdAt}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </Link>
          ))}
          {data.archives.length === 0 && <p className="text-sm text-muted">No archive records yet.</p>}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card><CardHeader><div><CardTitle>Archive preview</CardTitle><CardDescription>Preview PDF and image files online.</CardDescription></div></CardHeader><FilePreview /></Card>
        <Card><CardHeader><div><CardTitle>Version history</CardTitle><CardDescription>Keep every archive version traceable.</CardDescription></div></CardHeader><VersionList /></Card>
      </div>
      <ArchiveChecker />
    </div>
  );
}
