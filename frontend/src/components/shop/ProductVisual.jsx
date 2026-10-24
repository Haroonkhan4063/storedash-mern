import { useState } from 'react';
import { getCategoryIcon, hueFromString } from '../../lib/categories.js';

/**
 * Product imagery with a deterministic generated fallback. When the remote
 * image is missing or fails to load, a category-themed gradient tile keeps the
 * layout intact and visually consistent.
 * @param {{product: {title: string, category: string, imageUrl?: string}, className?: string, iconSize?: number}} props
 */
export default function ProductVisual({ product, className = '', iconSize = 40 }) {
  const [failed, setFailed] = useState(false);
  const Icon = getCategoryIcon(product.category);
  const hue = hueFromString(product.title);

  if (product.imageUrl && !failed) {
    return (
      <div className={`relative overflow-hidden bg-ink-800 ${className}`}>
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={product.title}
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 24%), hsl(${(hue + 60) % 360} 70% 12%))` }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl" style={{ background: `hsl(${(hue + 30) % 360} 90% 60%)` }} />
      <Icon size={iconSize} className="relative text-white/80" strokeWidth={1.4} />
    </div>
  );
}
