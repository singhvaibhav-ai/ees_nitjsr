import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { toLocalInput } from "@/lib/format";
import type { Edition } from "@/lib/types";
import { saveEdition } from "../actions";

export default async function Editions() {
  const supabase = await createClient();
  const { data } = await supabase.from("editions").select("*").order("starts_on", { ascending: false });
  const editions = (data ?? []) as Edition[];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pravardhan and other editions</h1>
      <p className="text-sm text-muted">
        An edition groups events into a fest. Until its announce time, the Pravardhan page shows &ldquo;coming soon&rdquo; and
        its events stay hidden, even if they&apos;re published. The newest edition whose slug starts with
        &ldquo;pravardhan&rdquo; is the one on /pravardhan.
      </p>
      {[...editions, null].map((ed) => (
        <ActionForm key={ed?.id ?? "new"} action={saveEdition} className="panel grid gap-3 sm:grid-cols-2" submit={ed ? "Save" : "Create edition"} submitClass="btn-primary btn-sm w-fit">
          <h2 className="font-bold sm:col-span-2">{ed ? ed.name : "New edition"}</h2>
          {ed && <input type="hidden" name="id" value={ed.id} />}
          <div><label className="label">Name</label><input name="name" className="input" defaultValue={ed?.name} required placeholder="Pravardhan 2027" /></div>
          <div><label className="label">Slug</label><input name="slug" className="input" defaultValue={ed?.slug} placeholder="pravardhan-2027" /></div>
          <div><label className="label">Starts</label><input name="starts_on" type="date" className="input" defaultValue={ed?.starts_on ?? ""} /></div>
          <div><label className="label">Ends</label><input name="ends_on" type="date" className="input" defaultValue={ed?.ends_on ?? ""} /></div>
          <div><label className="label">Announce at (IST)</label><input name="announce_at" type="datetime-local" className="input" defaultValue={toLocalInput(ed?.announce_at)} /></div>
          <div><label className="label">Tagline</label><input name="tagline" className="input" defaultValue={ed?.tagline ?? ""} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea name="description" rows={3} className="input" defaultValue={ed?.description ?? ""} /></div>
        </ActionForm>
      ))}
    </div>
  );
}
