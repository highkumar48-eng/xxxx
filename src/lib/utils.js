export const formatViews = (n = 0) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export function durationLabel(seconds) {
  if (!seconds) return "VIDEO";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export function ago(date) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date)) / 86400000),
  );
  return days === 0
    ? "Today"
    : days === 1
      ? "1 day ago"
      : days < 30
        ? `${days} days ago`
        : new Date(date).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
          });
}
