const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

const FILES_PREFIX = '/api/files/';
const LEGACY_FILES_PREFIX = '/files/';

export function toAbsoluteUrl(url) {
  if (!url) return url;

  // Already an absolute URL
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // Current relative file path
  if (url.startsWith(FILES_PREFIX)) {
    return `${API_URL}${url}`;
  }

  // Database paths saved before the /api context-path fix
  if (url.startsWith(LEGACY_FILES_PREFIX)) {
    return `${API_URL}${FILES_PREFIX}${url.slice(LEGACY_FILES_PREFIX.length)}`;
  }

  return url;
}

export function toAbsoluteImageUrls(html) {
  if (!html) return html;

  return html.replace(
    /src="([^"]+)"/g,
    (_, src) => `src="${toAbsoluteUrl(src)}"`
  );
}

export function toRelativeImageUrls(html) {
  if (!html) return html;

  return html.replace(
    /src="([^"]+)"/g,
    (_, src) => {
      const absoluteCurrent = `${API_URL}${FILES_PREFIX}`;
      const absoluteLegacy = `${API_URL}${LEGACY_FILES_PREFIX}`;

      if (src.startsWith(absoluteCurrent)) {
        return `src="${LEGACY_FILES_PREFIX}${src.slice(absoluteCurrent.length)}"`;
      }

      if (src.startsWith(absoluteLegacy)) {
        return `src="${LEGACY_FILES_PREFIX}${src.slice(absoluteLegacy.length)}"`;
      }

      if (src.startsWith(FILES_PREFIX)) {
        return `src="${LEGACY_FILES_PREFIX}${src.slice(FILES_PREFIX.length)}"`;
      }

      return `src="${src}"`;
    }
  );
}