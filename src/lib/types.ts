export type Gender = "woman" | "man";

export const GENDERS: Gender[] = ["woman", "man"];

export const GENDER_LABELS: Record<Gender, string> = {
  woman: "Žena",
  man: "Muž",
};

export const INTEREST_LABELS: Record<Gender, string> = {
  woman: "Ženy",
  man: "Muže",
};

/** Kontakty, které si člověk vyplní v profilu; cizí vidíš až po matchi (get_matches). */
export interface Contacts {
  instagram: string | null;
  snapchat: string | null;
  phone: string | null;
}

/** Souhlasy z obrazovky /souhlas (public.consents). */
export interface Consent {
  terms_version: string;
  marketing: boolean;
}

export interface Profile extends Contacts {
  id: string;
  display_name: string;
  birthdate: string;
  gender: Gender;
  interested_in: Gender[];
  bio: string;
  photos: string[];
}

/** Karta v balíčku (výstup RPC get_deck) */
export interface DeckCard {
  id: string;
  display_name: string;
  age: number;
  gender: Gender;
  bio: string;
  photos: string[];
}

/** Výstup RPC get_matches (kontakty protějšku jsou vidět jen tady, tedy po matchi) */
export interface MatchRow extends Contacts {
  match_id: string;
  matched_at: string;
  event_name: string | null;
  other_id: string;
  display_name: string;
  age: number;
  bio: string;
  photos: string[];
}

/** Výstup RPC past_events (historie akcí GetUp) */
export interface PastEvent {
  id: string;
  name: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  attended: boolean;
}

export interface EventRow {
  id: string;
  name: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  join_code?: string;
}

// ---------- Administrace (RPC admin_*) ----------

export interface AdminOverview {
  users: number;
  new_users_7d: number;
  profiles: number;
  events: number;
  matches: number;
  matches_24h: number;
  with_contact: number;
  open_reports: number;
  banned: number;
}

export interface AdminEvent extends Required<EventRow> {
  attendees: number;
  matches: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  display_name: string | null;
  age: number | null;
  gender: Gender | null;
  photo: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  events: number;
  matches: number;
  reports: number;
  banned: boolean;
  organizer: boolean;
  total: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile: {
    display_name: string;
    birthdate: string;
    age: number;
    gender: Gender;
    interested_in: Gender[];
    bio: string;
    photos: string[];
    instagram: string | null;
    snapchat: string | null;
    phone: string | null;
  } | null;
  organizer: boolean;
  ban: { reason: string; created_at: string } | null;
  stats: { likes_given: number; likes_received: number; matches: number };
  events: { id: string; name: string; starts_at: string; ends_at: string; visible: boolean }[];
  reports: { id: number; reason: string; created_at: string; resolved_at: string | null; reporter: string | null }[];
}

export interface AdminReport {
  id: number;
  reason: string;
  created_at: string;
  resolved_at: string | null;
  reporter_id: string;
  reporter_name: string | null;
  reported_id: string;
  reported_name: string | null;
  reported_photo: string | null;
  reported_banned: boolean;
  reported_total: number;
}

export interface Organizer {
  user_id: string;
  email: string;
  display_name: string | null;
  photo: string | null;
  created_at: string;
}

// ---------- Můj účet ----------

export interface MyStats {
  events: number;
  likes: number;
  passes: number;
  matches: number;
}

export interface MyLike {
  user_id: string;
  display_name: string;
  age: number;
  photo: string;
  event_name: string | null;
  liked_at: string;
  match_id: string | null;
}
