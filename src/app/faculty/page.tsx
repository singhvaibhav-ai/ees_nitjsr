import type { Metadata } from "next";
import { FacultyClient } from "./faculty-client";

export const metadata: Metadata = {
  title: "Faculty Profiles & Digital ID",
  description: "Faculty directory and digital credentials of the Department of Electrical Engineering at NIT Jamshedpur.",
};

export default function FacultyPage() {
  return (
    <div className="container-x py-12">
      <div className="mb-10 max-w-3xl">
        <p className="eyebrow">Academic Mentors & Leadership</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
          Faculty <span className="text-brand">Directory</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Distinguished professors, research mentors, and society coordinators of the Department of Electrical
          Engineering, National Institute of Technology Jamshedpur.
        </p>
      </div>

      <FacultyClient />
    </div>
  );
}
