import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { CATEGORY_MAP } from '../data/categories';

// Shows the product photo; if the URL is missing or fails to load, falls back
// to a tinted tile with the category icon so the layout never breaks.
export default function ProductImage({ src, alt, category, className = '' }) {
  const [bad, setBad] = useState(false);
  const cat = CATEGORY_MAP[category];
  const Icon = cat?.icon || ImageOff;

  if (!src || bad) {
    return (
      <div
        className={`img-fallback ${className}`}
        role="img"
        aria-label={alt}
        style={cat ? { background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` } : undefined}
      >
        <Icon size={44} strokeWidth={1.3} />
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}
