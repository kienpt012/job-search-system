import { useEffect, useState } from "react";
import { getFallbackImage, resolveImageUrl } from "../utils/image";

export default function AppImage({
  src,
  fallbackSrc,
  fallbackVariant = "default",
  alt = "",
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
