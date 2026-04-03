const apiUrl = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

const buildPlaceholder = (label, width, height) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f1f5f9" />
      <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="12" fill="#e2e8f0" stroke="#cbd5e1" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b"
        font-family="Arial, sans-serif" font-size="18">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getFallbackImage = (variant = "default") => {
  switch (variant) {
    case "cover":
      return buildPlaceholder("No cover", 1200, 400);
    case "avatar":
      return buildPlaceholder("No avatar", 240, 240);
    case "logo":
      return buildPlaceholder("No logo", 240, 240);
    default:
      return buildPlaceholder("No image", 400, 300);
  }
};

export const resolveImageUrl = (src) => {
  if (!src) return "";

  if (/^(data:|blob:)/i.test(src)) {
    return src;
  }

  if (apiUrl) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1):3000\/storage\//i.test(src)) {
      return src.replace(
        /^https?:\/\/(localhost|127\.0\.0\.1):3000/i,
        apiUrl
      );
    }

    if (src.startsWith("/storage/")) {
      return `${apiUrl}${src}`;
    }
  }

  return src;
};
