import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combines Tailwind CSS classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared formatting + status helpers used across the app. */

export const currency = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

export const compactNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(value ?? 0)
  );

export const number = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US").format(Number(value ?? 0));

export const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const relativeTime = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export type Tone = "blue" | "green" | "amber" | "red" | "slate" | "violet";

const STATUS_TONES: Record<string, Tone> = {
  pending: "amber",
  approved: "green",
  fulfilled: "blue",
  issued: "blue",
  rejected: "red",
  cancelled: "slate",
  ok: "green",
  low: "amber",
  out: "red",
  active: "green",
  inactive: "slate",
};

export const statusTone = (status?: string | null): Tone =>
  STATUS_TONES[String(status ?? "").toLowerCase()] ?? "slate";

export const statusLabel = (status?: string | null) => {
  const value = String(status ?? "").toLowerCase();
  if (value === "out") return "Out of stock";
  if (value === "low") return "Low stock";
  if (value === "ok") return "In stock";
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/** Turn a thrown API error into a readable message. */
export const errorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
      .replace(/^Unauthorized:\s*/i, "")
      .replace(/^Forbidden:\s*/i, "")
      .replace(/^Bad request:\s*/i, "")
      .replace(/^Conflict:\s*/i, "")
      .replace(/^Not found:\s*/i, "");
  }
  return "Something went wrong. Please try again.";
};

export const initials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";