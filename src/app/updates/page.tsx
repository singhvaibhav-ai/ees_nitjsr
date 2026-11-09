import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { UpdatesClient } from "./updates-client";

export const metadata: Metadata = {
  title: "Society Updates & Feed",
  description: "Official notices, announcements, fest highlights, and updates from the Electrical Engineering Society, NIT Jamshedpur.",
};

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
};

export default async function UpdatesPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, title, body, cover_url, published_at, created_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="container-x max-w-2xl py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Society Feed</p>
          <h1 className="mt-1 text-4xl font-bold">Latest Updates</h1>
          <p className="text-sm text-muted mt-1">Official announcements, fest teasers, and departmental notices.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Live Feed</span>
        </div>
      </div>

      <UpdatesClient posts={(posts ?? []) as Post[]} />
    </div>
  );
}
