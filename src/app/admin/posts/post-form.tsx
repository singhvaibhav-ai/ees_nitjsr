import { ActionForm } from "@/components/forms";
import { savePost } from "../actions";

type Post = { id: string; title: string; slug: string; body: string; cover_url: string | null; is_published: boolean };

export function PostForm({ p }: { p?: Post }) {
  return (
    <ActionForm action={savePost} className="panel space-y-4" submit={p ? "Save" : "Create"}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div><label className="label">Title</label><input name="title" className="input" defaultValue={p?.title} required /></div>
      <div><label className="label">URL slug</label><input name="slug" className="input" defaultValue={p?.slug} placeholder="Made from the title if empty" /></div>
      <div>
        <label className="label">Poster or cover image</label>
        <input name="cover" type="file" accept="image/*" className="input" />
        {p?.cover_url && <p className="hint">An image is set. Upload to replace it.</p>}
      </div>
      <div><label className="label">Text</label><textarea name="body" rows={12} className="input" defaultValue={p?.body} /></div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="is_published" defaultChecked={p?.is_published} className="h-4 w-4" /> Published
      </label>
    </ActionForm>
  );
}
