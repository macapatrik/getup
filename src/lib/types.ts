export type Gender = "woman" | "man" | "nonbinary";

export const GENDERS: Gender[] = ["woman", "man", "nonbinary"];

export const GENDER_LABELS: Record<Gender, string> = {
  woman: "Žena",
  man: "Muž",
  nonbinary: "Nebinární",
};

export const INTEREST_LABELS: Record<Gender, string> = {
  woman: "Ženy",
  man: "Muže",
  nonbinary: "Nebinární lidi",
};

export interface Profile {
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

/** Výstup RPC get_matches */
export interface MatchRow {
  match_id: string;
  matched_at: string;
  event_name: string | null;
  other_id: string;
  display_name: string;
  age: number;
  bio: string;
  photos: string[];
  last_message: string | null;
  last_message_at: string | null;
  last_sender_id: string | null;
}

export interface EventRow {
  id: string;
  name: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  join_code?: string;
}

export interface Message {
  id: number;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}
