const addedAt = (b) => new Date(b?.releaseDate ?? b?.createdAt ?? b?.dateAdded ?? b?.addedAt ?? 0).getTime() || 0;

// Books added in the last `days` days. When fewer than `minimum` qualify (a quiet quarter),
// fall back to the newest `fallback` books so New Releases is never an empty page.
export const getNewReleases = (books = [], { days = 90, minimum = 8, fallback = 20 } = {}) => {
  const now = Date.now();
  const recent = books.filter((b) => b.isNew === true || (addedAt(b) && (now - addedAt(b)) / 86400000 <= days));
  if (recent.length >= minimum) return recent;
  return [...books].sort((a, b) => addedAt(b) - addedAt(a)).slice(0, fallback);
};
