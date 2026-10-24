import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dateOnly } from "@/lib/format";

export const metadata: Metadata = { title: "Updates" };

export default async function Updates() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, title, body, cover_url, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="container-x max-w-3xl py-12">
      <p className="eyebrow">News and notices</p>
      <h1 className="mt-1 text-4xl font-bold">Updates</h1>
      <div className="mt-8 space-y-6">
        {posts?.length ? (
          posts.map((p) => (
            <Link key={p.slug} href={`/updates/${p.slug}`} className="card block hover:-translate-y-0.5">
              {p.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_url} alt="" className="-mx-5 -mt-5 mb-4 max-h-72 w-[calc(100%+2.5rem)] rounded-t-[10px] object-cover" />
              )}
              <p className="text-xs text-muted">{dateOnly(p.published_at)}</p>
              <h2 className="mt-1 text-2xl font-bold">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-muted">{p.body}</p>
            </Link>
          ))
        ) : (
          <p className="text-muted">No updates yet.</p>
        )}
      </div>
    </div>
  );
}
