"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/types";

export function SubmitButton({ children, className = "btn-primary", pendingText = "Saving…" }: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function Notice({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>;
  if (state.ok)
    return <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{state.ok}</p>;
  return null;
}

// A form wired to a server action that returns { error } or { ok }
export function ActionForm({
  action,
  children,
  className = "space-y-4",
  submit,
  submitClass,
  pendingText,
  confirm,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children?: ReactNode;
  className?: string;
  submit?: ReactNode;
  submitClass?: string;
  pendingText?: string;
  confirm?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
      <Notice state={state} />
      {submit && (
        <SubmitButton className={submitClass} pendingText={pendingText}>
          {submit}
        </SubmitButton>
      )}
    </form>
  );
}
