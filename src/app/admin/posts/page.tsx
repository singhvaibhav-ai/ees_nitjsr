import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dateOnly } from "@/lib/format";

export default async function AdminPosts() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("id, title, is_published, published_at, created_at").order("created_at", { ascending: false });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Updates</h1>
        <Link href="/admin/posts/new" className="btn-primary btn-sm">New post</Link>
      </div>
      <table className="table-x mt-6">
        <thead><tr><th>Title</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {(posts ?? []).map((p) => (
            <tr key={p.id}>
              <td><Link href={`/admin/posts/${p.id}`} className="font-semibold text-brand">{p.title}</Link></td>
              <td>{p.is_published ? "Published" : "Draft"}</td>
              <td>{dateOnly(p.published_at ?? p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
