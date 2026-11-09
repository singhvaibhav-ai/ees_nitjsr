import type { Metadata } from "next";
import { EplClient } from "./epl-client";

export const metadata: Metadata = {
  title: "Electrical Premier League (EPL)",
  description: "Live fixtures, standings, and player stats for the Electrical Premier League at NIT Jamshedpur.",
};

export default function EplPage() {
  return (
    <div className="container-x py-12">
      <div className="mb-10 max-w-3xl">
        <p className="eyebrow">Department of Electrical Engineering</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
          Electrical Premier <span className="text-brand">League</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          The annual intra-department cricket extravaganza of EES NIT Jamshedpur. Follow match results, live points
          table standings, cap leaders, and the road to the Grand Final.
        </p>
      </div>

      <EplClient />
    </div>
  );
}
