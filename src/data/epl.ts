export type EplTeam = {
  id: string;
  name: string;
  shortName: string;
  batch: string;
  captain: string;
  color: string;
  bgLight: string;
  description: string;
};

export type EplMatch = {
  id: string;
  matchNumber: number;
  stage: string;
  date: string;
  time: string;
  venue: string;
  teamAId: string;
  teamBId: string;
  status: "completed" | "live" | "upcoming";
  scoreA?: string;
  oversA?: string;
  scoreB?: string;
  oversB?: string;
  result?: string;
  potm?: string; // Player of the Match
};

export type EplStanding = {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  nrr: string;
  points: number;
  form: ("W" | "L" | "T")[];
};

export type EplPlayerStat = {
  name: string;
  team: string;
  statValue: number | string;
  statDetail: string;
};

export const EPL_TEAMS: EplTeam[] = [
  {
    id: "sparks",
    name: "Sparks XI",
    shortName: "SPK",
    batch: "Final Year (Batch 2023)",
    captain: "Aditya Bhardwaj",
    color: "#0052ff",
    bgLight: "#eff6ff",
    description: "Reigning champions with devastating batting depth and veteran poise.",
  },
  {
    id: "voltage",
    name: "Voltage Warriors",
    shortName: "VLT",
    batch: "3rd Year (Batch 2024)",
    captain: "Ayush Raghav",
    color: "#e11d48",
    bgLight: "#fff1f2",
    description: "Aggressive pace battery and athletic fielders hungry for the championship cup.",
  },
  {
    id: "circuit",
    name: "Circuit Kings",
    shortName: "CRK",
    batch: "2nd Year (Batch 2025)",
    captain: "Sumant Nanda",
    color: "#0d9488",
    bgLight: "#f0fdfa",
    description: "Young dynamos known for sharp spin combinations and resilient middle-order chases.",
  },
  {
    id: "dynamo",
    name: "Dynamo Titans",
    shortName: "DYN",
    batch: "Postgraduate & Research Scholars",
    captain: "Amit Choudhary",
    color: "#d97706",
    bgLight: "#fffbeb",
    description: "The masters of tactical patience and reliable death-overs bowling.",
  },
  {
    id: "tesla",
    name: "Tesla Strikers",
    shortName: "TSL",
    batch: "Faculty & Staff XI",
    captain: "Dr. Ravi Bhushan",
    color: "#7c3aed",
    bgLight: "#f5f3ff",
    description: "Experience meets finesse in the most beloved exhibition squad of NIT JSR.",
  },
  {
    id: "challengers",
    name: "Current Challengers",
    shortName: "CCH",
    batch: "1st Year Freshers (Batch 2026)",
    captain: "Yuvraj Singh",
    color: "#16a34a",
    bgLight: "#f0fdf4",
    description: "Untamed young firepower eager to cause upsets against senior heavyweights.",
  },
];

export const EPL_STANDINGS: EplStanding[] = [
  { teamId: "sparks", played: 4, won: 4, lost: 0, tied: 0, nrr: "+1.650", points: 8, form: ["W", "W", "W", "W"] },
  { teamId: "voltage", played: 4, won: 3, lost: 1, tied: 0, nrr: "+0.820", points: 6, form: ["W", "L", "W", "W"] },
  { teamId: "circuit", played: 4, won: 2, lost: 2, tied: 0, nrr: "+0.110", points: 4, form: ["L", "W", "L", "W"] },
  { teamId: "dynamo", played: 4, won: 2, lost: 2, tied: 0, nrr: "-0.240", points: 4, form: ["W", "L", "W", "L"] },
  { teamId: "challengers", played: 4, won: 1, lost: 3, tied: 0, nrr: "-0.950", points: 2, form: ["L", "W", "L", "L"] },
  { teamId: "tesla", played: 4, won: 0, lost: 4, tied: 0, nrr: "-1.410", points: 0, form: ["L", "L", "L", "L"] },
];

export const EPL_MATCHES: EplMatch[] = [
  {
    id: "m1",
    matchNumber: 1,
    stage: "Group Stage",
    date: "2026-10-18",
    time: "09:30 AM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "sparks",
    teamBId: "challengers",
    status: "completed",
    scoreA: "172/4",
    oversA: "15.0",
    scoreB: "128/9",
    oversB: "15.0",
    result: "Sparks XI won by 44 runs",
    potm: "Aditya Prem (64 off 29 balls)",
  },
  {
    id: "m2",
    matchNumber: 2,
    stage: "Group Stage",
    date: "2026-10-18",
    time: "02:00 PM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "voltage",
    teamBId: "circuit",
    status: "completed",
    scoreA: "154/6",
    oversA: "15.0",
    scoreB: "148/7",
    oversB: "15.0",
    result: "Voltage Warriors won by 6 runs",
    potm: "Ayush Raghav (42 runs & 2 wkts)",
  },
  {
    id: "m3",
    matchNumber: 3,
    stage: "Group Stage",
    date: "2026-10-19",
    time: "02:30 PM",
    venue: "SAC Ground, NIT JSR",
    teamAId: "dynamo",
    teamBId: "tesla",
    status: "completed",
    scoreA: "139/5",
    oversA: "15.0",
    scoreB: "124/8",
    oversB: "15.0",
    result: "Dynamo Titans won by 15 runs",
    potm: "Amit Choudhary (51* off 34 balls)",
  },
  {
    id: "m4",
    matchNumber: 4,
    stage: "Group Stage",
    date: "2026-10-21",
    time: "09:30 AM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "sparks",
    teamBId: "voltage",
    status: "completed",
    scoreA: "165/3",
    oversA: "15.0",
    scoreB: "159/8",
    oversB: "15.0",
    result: "Sparks XI won by 6 runs",
    potm: "Rishit Raj (3 wkts for 19)",
  },
  {
    id: "m5",
    matchNumber: 5,
    stage: "Group Stage",
    date: "2026-10-22",
    time: "02:00 PM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "circuit",
    teamBId: "dynamo",
    status: "completed",
    scoreA: "145/6",
    oversA: "15.0",
    scoreB: "132/9",
    oversB: "15.0",
    result: "Circuit Kings won by 13 runs",
    potm: "Siddharth (38 runs & 3 wkts)",
  },
  {
    id: "m6",
    matchNumber: 6,
    stage: "Group Stage",
    date: "2026-10-23",
    time: "02:30 PM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "challengers",
    teamBId: "tesla",
    status: "completed",
    scoreA: "161/4",
    oversA: "15.0",
    scoreB: "135/7",
    oversB: "15.0",
    result: "Current Challengers won by 26 runs",
    potm: "Yuvraj Singh (58 off 32 balls)",
  },
  {
    id: "m7",
    matchNumber: 7,
    stage: "Qualifier 1",
    date: "2026-10-25",
    time: "09:30 AM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "sparks",
    teamBId: "voltage",
    status: "upcoming",
  },
  {
    id: "m8",
    matchNumber: 8,
    stage: "Eliminator",
    date: "2026-10-25",
    time: "02:00 PM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "circuit",
    teamBId: "dynamo",
    status: "upcoming",
  },
  {
    id: "m9",
    matchNumber: 9,
    stage: "Qualifier 2",
    date: "2026-10-26",
    time: "09:30 AM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "voltage",
    teamBId: "circuit",
    status: "upcoming",
  },
  {
    id: "m10",
    matchNumber: 10,
    stage: "Grand Final",
    date: "2026-10-26",
    time: "02:30 PM",
    venue: "Oval Ground, NIT JSR",
    teamAId: "sparks",
    teamBId: "voltage",
    status: "upcoming",
  },
];

export const ORANGE_CAP_LEADERS: EplPlayerStat[] = [
  { name: "Aditya Prem", team: "Sparks XI", statValue: 194, statDetail: "SR 182.4 · 4 innings · HS 64" },
  { name: "Ayush Raghav", team: "Voltage Warriors", statValue: 168, statDetail: "SR 156.8 · 4 innings · HS 52" },
  { name: "Amit Choudhary", team: "Dynamo Titans", statValue: 153, statDetail: "SR 141.2 · 4 innings · HS 51*" },
  { name: "Yuvraj Singh", team: "Current Challengers", statValue: 142, statDetail: "SR 164.0 · 4 innings · HS 58" },
  { name: "Nikhil Rajak", team: "Sparks XI", statValue: 129, statDetail: "SR 148.5 · 4 innings · HS 46" },
];

export const PURPLE_CAP_LEADERS: EplPlayerStat[] = [
  { name: "Rishit Raj", team: "Sparks XI", statValue: 9, statDetail: "Econ 5.80 · 14.2 overs · BBI 3/19" },
  { name: "Siddharth", team: "Circuit Kings", statValue: 8, statDetail: "Econ 6.12 · 15.0 overs · BBI 3/22" },
  { name: "Ronit", team: "Voltage Warriors", statValue: 7, statDetail: "Econ 6.45 · 14.0 overs · BBI 3/24" },
  { name: "Debagnik Mandal", team: "Voltage Warriors", statValue: 6, statDetail: "Econ 6.85 · 13.0 overs · BBI 2/18" },
  { name: "Sumant Nanda", team: "Circuit Kings", statValue: 5, statDetail: "Econ 7.10 · 12.0 overs · BBI 2/21" },
];
