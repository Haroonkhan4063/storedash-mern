import { BRAND } from '../../config/brand.js';

/**
 * Brand mark: a faceted hexagon with a gradient core, paired with the wordmark.
 * @param {{className?: string}} props
 */
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-white ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="nx-g" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path d="M16 2l12 7v14l-12 7L4 23V9l12-7z" fill="url(#nx-g)" opacity="0.22" stroke="url(#nx-g)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M10 21v-5M16 21V11M22 21v-8" stroke="url(#nx-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {BRAND.name}
    </span>
  );
}
