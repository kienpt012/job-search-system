import { useEffect, useState } from "react";
import { getFallbackImage, resolveImageUrl } from "../utils/image";

export default function AppImage({
  src,
  fallbackSrc,
  fallbackVariant = "default",
  alt = "",
  loading,
  decoding = "async",
  fetchPriority,
  priority = false,
  onError,
  ...props
}) {
  const safeFallback = fallbackSrc || getFallbackImage(fallbackVariant);
  const [currentSrc, setCurrentSrc] = useState(
    resolveImageUrl(src) || safeFallback
  );

  useEffect(() => {
    setCurrentSrc(resolveImageUrl(src) || safeFallback);
  }, [src, safeFallback]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={loading || (priority ? "eager" : "lazy")}
      decoding={decoding}
      fetchPriority={fetchPriority || (priority ? "high" : "auto")}
      onError={(event) => {
        if (currentSrc !== safeFallback) {
          setCurrentSrc(safeFallback);
        }

        if (onError) {
          onError(event);
        }
      }}
    />
  );
}
