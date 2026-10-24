import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dateOnly } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("title, cover_url").eq("slug", slug).maybeSingle();
  return { title: data?.title ?? "Update", openGraph: data?.cover_url ? { images: [data.cover_url] } : undefined };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (!p) notFound();
  return (
    <article className="container-x max-w-3xl py-12">
      <Link href="/updates" className="text-sm text-brand">← Updates</Link>
      <p className="mt-4 text-sm text-muted">{dateOnly(p.published_at)}</p>
      <h1 className="mt-1 text-4xl font-bold">{p.title}</h1>
      {p.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover_url} alt="" className="mt-6 w-full rounded-xl border-2 border-ink" />
      )}
      <div className="prose-x mt-6 text-lg">{p.body}</div>
    </article>
  );
}
