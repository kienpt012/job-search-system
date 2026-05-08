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

const buildLogoPlaceholder = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="32" fill="#f6fbf8" />
      <rect x="44" y="42" width="152" height="156" rx="24" fill="#e8f8ef" stroke="#ccebdd" stroke-width="4" />
      <path d="M82 184V72h76v112" fill="#ffffff" stroke="#087443" stroke-width="8" stroke-linejoin="round" />
      <path d="M102 98h12M126 98h12M102 124h12M126 124h12M102 150h12M126 150h12" stroke="#00a85a" stroke-width="8" stroke-linecap="round" />
      <path d="M94 184h52" stroke="#087443" stroke-width="8" stroke-linecap="round" />
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
      return buildLogoPlaceholder();
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
