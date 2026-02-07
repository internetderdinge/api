export const resolvePossiblyRelativeUrl = (maybeUrl?: string | null, baseUrl?: string | null) => {
  if (!maybeUrl) return null;
  if (maybeUrl.startsWith('http')) return maybeUrl;

  if (baseUrl && baseUrl.startsWith('http')) {
    try {
      return new URL(maybeUrl, baseUrl).toString();
    } catch {
      return maybeUrl;
    }
  }

  return maybeUrl;
};
