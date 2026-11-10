"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, MessageCircle, Check, Sparkles, Bookmark, Calendar } from "lucide-react";
import { dateOnly } from "@/lib/format";

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
};

export function UpdatesClient({ posts }: { posts: Post[] }) {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function toggleLike(id: string) {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleShare(slug: string, id: string) {
    const url = `${window.location.origin}/updates/${slug}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="card text-center py-16 space-y-3">
        <Sparkles size={36} className="mx-auto text-sun" />
        <h2 className="text-xl font-bold">No updates posted yet</h2>
        <p className="text-sm text-muted max-w-sm mx-auto">
          Check back soon or follow the Electrical Engineering Society on campus channels for upcoming announcements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => {
        const isLiked = Boolean(likedPosts[post.id]);
        const isCopied = copiedId === post.id;

        return (
          <article
            key={post.id}
            className="rounded-2xl border-2 border-ink bg-white overflow-hidden shadow-[4px_4px_0_0_#0f172a] transition hover:shadow-[6px_6px_0_0_#0f172a]"
          >
            {/* Header: Author info */}
            <div className="flex items-center justify-between p-4 border-b border-line bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-ink bg-sun flex items-center justify-center overflow-hidden shrink-0">
                  <Image
                    src="/images/ees-logo-transparent.png"
                    alt="EES"
                    width={36}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight">ees_nitjsr</span>
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-brand text-white text-[9px] font-bold">
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-muted flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{dateOnly(post.published_at ?? post.created_at)}</span>
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-sun/20 border border-sun px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                Official
              </span>
            </div>

            {/* Post Cover Image */}
            {post.cover_url && (
              <div className="relative border-b-2 border-ink bg-slate-100 max-h-[500px] overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover_url}
                  alt={post.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  aria-label="Like post"
                  className="transition hover:scale-110 active:scale-95"
                >
                  <Heart
                    size={22}
                    className={isLiked ? "fill-red-500 text-red-500 transition" : "text-ink hover:text-red-500"}
                  />
                </button>

                <Link href={`/updates/${post.slug}`} aria-label="View post" className="hover:scale-110 transition">
                  <MessageCircle size={22} className="text-ink hover:text-brand" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleShare(post.slug, post.id)}
                  aria-label="Share post"
                  className="transition hover:scale-110"
                >
                  {isCopied ? (
                    <Check size={20} className="text-emerald-600" />
                  ) : (
                    <Share2 size={20} className="text-ink hover:text-brand" />
                  )}
                </button>
              </div>

              <Bookmark size={20} className="text-muted" />
            </div>

            {/* Caption & Body */}
            <div className="px-4 pb-4 space-y-2">
              <Link href={`/updates/${post.slug}`}>
                <h2 className="font-bold text-lg hover:text-brand transition">{post.title}</h2>
              </Link>

              <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                <span className="font-bold mr-1.5">ees_nitjsr</span>
                {post.body}
              </div>

              {/* Tags & Permanent Link */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line text-xs">
                <div className="flex flex-wrap gap-1.5 text-brand font-medium">
                  <span>#EESNITJSR</span>
                  <span>#Pravardhan2026</span>
                  <span>#NITJSR</span>
                </div>
                <Link
                  href={`/updates/${post.slug}`}
                  className="font-semibold text-muted hover:text-brand text-[11px]"
                >
                  Permalink →
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

