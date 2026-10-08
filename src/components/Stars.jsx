import { Star } from 'lucide-react';

export default function Stars({ rating = 0, reviews, size = 14, full = false }) {
  const r = Number(rating) || 0;
  return (
    <span className="stars" aria-label={`Rated ${r.toFixed(1)} out of 5`}>
      {full ? (
        [1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            strokeWidth={1.5}
            className={n <= Math.round(r) ? 'on' : 'off'}
            fill={n <= Math.round(r) ? 'currentColor' : 'none'}
          />
        ))
      ) : (
        <Star size={size} fill="currentColor" strokeWidth={0} className="on" />
      )}
      <b>{r.toFixed(1)}</b>
      {reviews != null && <em>({Number(reviews).toLocaleString('en-IN')})</em>}
    </span>
  );
}
