export function Skeleton({ w = '100%', h = 16, r = 10, style }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="pcard skeleton-card" aria-hidden="true">
      <div className="skel" style={{ aspectRatio: '1 / 1', borderRadius: 0 }} />
      <div className="pcard-body">
        <Skeleton w="40%" h={10} />
        <Skeleton w="85%" h={16} />
        <Skeleton w="50%" h={12} />
        <Skeleton w="45%" h={20} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid-products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
