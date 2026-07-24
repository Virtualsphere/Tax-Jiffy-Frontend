import { useEffect, useState, useRef } from 'react';
import { authStorage } from '@/features/auth/lib/auth-storage';

interface AuthenticatedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

/**
 * Renders an image that lives behind Spring Security authentication.
 *
 * The backend's /uploads/** endpoint requires a valid JWT token.
 * This component uses a plain fetch() (NOT apiClient, which adds /api prefix)
 * with the Bearer token injected manually — fetches the image as a blob,
 * then creates a local object URL so the <img> tag can display it.
 *
 * For external URLs (e.g. placehold.co), it renders a plain <img> directly.
 */
export function AuthenticatedImage({
  src,
  alt,
  className,
  style,
  fallback,
}: AuthenticatedImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const prevBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!src) {
      setError(false);
      setBlobUrl(null);
      return;
    }

    // External URLs (e.g. placehold.co) — use directly, no auth needed
    const isBackendUpload = src.includes('/uploads/');
    if (!isBackendUpload) {
      setBlobUrl(src);
      return;
    }

    let cancelled = false;
    setError(false);
    setBlobUrl(null);

    // Build the correct fetch URL:
    // Strip the API base URL prefix so we get the raw server origin,
    // then append the /uploads path.
    // e.g. "https://api.taxjiffy.com/uploads/photos/abc.png" fetched as:
    //      "http://localhost:5173/uploads/photos/abc.png" (Vite proxy → backend)
    let fetchUrl: string;
    try {
      // If src is an absolute URL, extract just the pathname
      const parsed = new URL(src);
      // In dev, route through Vite proxy using relative path (window.location origin)
      fetchUrl = window.location.origin + parsed.pathname;
    } catch {
      // Already relative
      fetchUrl = window.location.origin + src;
    }

    const token = authStorage.getToken();

    fetch(fetchUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    };
  }, []);

  if (error || !src) return <>{fallback ?? null}</>;
  if (!blobUrl) return null;

  return <img src={blobUrl} alt={alt} className={className} style={style} />;
}
