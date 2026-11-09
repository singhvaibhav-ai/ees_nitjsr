import type { Metadata } from "next";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from Pravardhan fests, technical workshops, EPL cricket, and life at EES NIT Jamshedpur.",
};

export default function GalleryPage() {
  return (
    <div className="container-x py-12">
      <div className="mb-10 max-w-3xl">
        <p className="eyebrow">Visual Archives</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
          EES <span className="text-brand">Gallery</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          A glimpse into the energy, innovation, and memories of the Electrical Engineering Society at NIT Jamshedpur:
          festivals, workshops, competitions, and campus life.
        </p>
      </div>

      <GalleryClient />
    </div>
  );
}
