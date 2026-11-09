"use client";

import { useState } from "react";
import { GALLERY_ITEMS, type GalleryItem } from "@/data/gallery";
import { X, ZoomIn, Calendar } from "lucide-react";

export function GalleryClient() {
  const [filter, setFilter] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = [
    { key: "all", label: "All Photos" },
    { key: "pravardhan", label: "Pravardhan Fest" },
    { key: "workshops", label: "Workshops & Tech" },
    { key: "sports", label: "EPL & Sports" },
    { key: "social", label: "Life at EES" },
  ];

  const filtered = filter === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((i) => i.category === filter);

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink pb-4">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
              filter === c.key ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="card group cursor-pointer overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0f172a]"
          >
            <div className="relative h-56 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow">
                  <ZoomIn size={14} /> View
                </span>
              </div>
              <span className="badge absolute top-3 left-3 border-ink/40 bg-white/90 text-ink backdrop-blur-sm">
                {item.categoryLabel}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {item.date}
                </span>
              </div>
              <h3 className="mt-1 text-base font-bold text-ink group-hover:text-brand">{item.title}</h3>
              <p className="mt-2 line-clamp-2 text-xs text-muted leading-relaxed">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="card relative max-h-[90vh] w-full max-w-3xl overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 rounded-full border-2 border-ink bg-white p-2 text-ink shadow-[2px_2px_0_0_#0f172a] hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="max-h-[60vh] w-full overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="max-h-[60vh] w-full object-contain mx-auto"
              />
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge bg-sun text-ink font-bold">{activeItem.categoryLabel}</span>
                <span className="text-xs text-muted">{activeItem.date}</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold">{activeItem.title}</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">{activeItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
