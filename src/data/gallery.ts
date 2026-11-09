export type GalleryItem = {
  id: string;
  title: string;
  category: "pravardhan" | "workshops" | "sports" | "social";
  categoryLabel: string;
  date: string;
  imageUrl: string;
  caption: string;
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Pravardhan Annual Fest Opening",
    category: "pravardhan",
    categoryLabel: "Pravardhan Fest",
    date: "November 2025",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    caption: "Inaugural ceremony of Pravardhan with faculty coordinators and student participants in the main auditorium.",
  },
  {
    id: "g2",
    title: "EES General Body & Core Committee",
    category: "social",
    categoryLabel: "Life at EES",
    date: "August 2026",
    imageUrl: "/images/members.jpg",
    caption: "EES Core committee and student volunteers gathered for the 2026-27 orientation drive.",
  },
  {
    id: "g3",
    title: "Hardware Hackathon & Circuit Design",
    category: "workshops",
    categoryLabel: "Workshops & Tech",
    date: "October 2025",
    imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80",
    caption: "Teams prototyping IoT circuit boards during the flagship Electrospection design round.",
  },
  {
    id: "g4",
    title: "EPL Championship Trophy Presentation",
    category: "sports",
    categoryLabel: "EPL & Sports",
    date: "March 2025",
    imageUrl: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80",
    caption: "Sparks XI lifting the prestigious Electrical Premier League trophy after a thrilling final.",
  },
  {
    id: "g5",
    title: "MATLAB & Algorithm Masterclass",
    category: "workshops",
    categoryLabel: "Workshops & Tech",
    date: "September 2025",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    caption: "Hands-on technical workshop for pre-final year students conducted in the department computing lab.",
  },
  {
    id: "g6",
    title: "Campus Cleanliness & Plantation Drive",
    category: "social",
    categoryLabel: "Life at EES",
    date: "July 2025",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    caption: "EES students planting saplings near the Electrical Engineering department block at NIT JSR.",
  },
  {
    id: "g7",
    title: "Electrohack 24-Hour Hackathon",
    category: "workshops",
    categoryLabel: "Workshops & Tech",
    date: "November 2025",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    caption: "Over 35 teams coding and wiring smart energy solutions through the night at Electrohack.",
  },
  {
    id: "g8",
    title: "Cultural Night & Pravardhan Gala",
    category: "pravardhan",
    categoryLabel: "Pravardhan Fest",
    date: "November 2025",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    caption: "Star-studded cultural evening celebrating student performers and festival winners.",
  },
  {
    id: "g9",
    title: "EPL Super Over Finish",
    category: "sports",
    categoryLabel: "EPL & Sports",
    date: "March 2026",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    caption: "The crowd erupts as Voltage Warriors defend 11 runs in the final over of the semi-final.",
  },
];
