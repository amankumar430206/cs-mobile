/** "UNDER_REVIEW" → "Under review" */
export function humanize(value: string) {
  const words = value.toLowerCase().split("_").filter(Boolean).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// Postgres numeric columns can arrive as strings; coerce before formatting.
export const formatINR = (amount: number | string) => inr.format(Number(amount) || 0);

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const fullDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatDate = (iso: string) => fullDate.format(new Date(iso));

/** "00011122233" → "•••• 2233" */
export const maskAccountNumber = (value: string) => `•••• ${value.slice(-4)}`;
const longDay = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" });

export const formatToday = (date = new Date()) => longDay.format(date);

/** "2026-09-15" (a calendar date) → "15 Sept", without a timezone shift. */
export const formatDayLabel = (date: string) => shortDate.format(new Date(`${date}T00:00:00`));

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatRelativeTime(iso: string, now = Date.now()) {
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return shortDate.format(new Date(iso));
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
