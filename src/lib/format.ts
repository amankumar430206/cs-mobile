/** "UNDER_REVIEW" → "Under review" */
export function humanize(value: string) {
  const words = value.toLowerCase().split("_").filter(Boolean).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
