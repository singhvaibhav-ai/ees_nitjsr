"use client";

import { Download, Printer } from "lucide-react";

export function IdCardActions({ memberNo }: { memberNo: string }) {
  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-3">
      <a
        href="/dashboard/id-card/image"
        download={`EES-ID-${memberNo}.png`}
        className="btn-primary flex items-center gap-2"
      >
        <Download size={16} /> Download PNG
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="btn-outline flex items-center gap-2 bg-white"
      >
        <Printer size={16} /> Print / Save as PDF
      </button>
    </div>
  );
}
