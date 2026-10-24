import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "../post-form";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-brand">← Updates</Link>
      <div className="mt-2 mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit post</h1>
        {p.is_published && <Link href={`/updates/${p.slug}`} className="btn-outline btn-sm" target="_blank">View</Link>}
      </div>
      <PostForm p={p} />
    </div>
  );
}
