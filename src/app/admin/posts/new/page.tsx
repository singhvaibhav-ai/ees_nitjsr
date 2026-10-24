import Link from "next/link";
import { PostForm } from "../post-form";

export default function NewPost() {
  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-brand">← Updates</Link>
      <h1 className="mt-2 mb-6 text-3xl font-bold">New post</h1>
      <PostForm />
    </div>
  );
}
