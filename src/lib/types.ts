export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  college: string | null;
  avatar_url: string | null;
  tshirt_size: string | null;
  is_nitjsr: boolean;
  reg_no: string | null;
  batch: number | null;
  programme: string | null;
  branch: string | null;
  roll: string | null;
  is_admin: boolean;
  onboarded: boolean;
};

export type Membership = {
  user_id: string;
  status: "pending" | "active" | "rejected";
  source: string | null;
  member_no: string | null;
  activated_at: string | null;
  tshirt_issued_at: string | null;
  note: string | null;
};

export type Drive = {
  id: string;
  academic_year: string;
  fee_paise: number;
  branch: string;
  programme: string;
  paying_batches: number[];
  auto_active_batches: number[];
  payment_account_id: string | null;
  deadline: string | null;
  is_current: boolean;
};

export type PaymentAccount = { id: string; label: string; owner_name: string; upi_id: string; qr_url: string | null };

export type Edition = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  starts_on: string | null;
  ends_on: string | null;
  announce_at: string | null;
  banner_url: string | null;
};

export type EventRow = {
  id: string;
  slug: string;
  edition_id: string | null;
  category: string;
  title: string;
  summary: string | null;
  description: string | null;
  rules: string | null;
  rulebook_url: string | null;
  prizes: string | null;
  venue: string | null;
  starts_at: string | null;
  ends_at: string | null;
  banner_url: string | null;
  contact: string | null;
  status: "draft" | "published" | "closed" | "completed";
  audience: "all" | "nitjsr";
  allowed_batches: number[];
  allowed_branches: string[];
  allowed_programmes: string[];
  members_only: boolean;
  team_min: number;
  team_max: number;
  capacity: number | null;
  reg_opens_at: string | null;
  reg_closes_at: string | null;
  needs_approval: boolean;
  fee_member_paise: number;
  fee_nitjsr_paise: number;
  fee_outsider_paise: number;
  payment_account_id: string | null;
};

export type ActionState = { error?: string; ok?: string } | null;
