import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, SearchX, X, Heart } from 'lucide-react';
import { fetchProducts } from '../services/db';
import { CATEGORIES } from '../data/categories';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { ProductGridSkeleton } from '../components/Skeleton';
import { EmptyState, ErrorState, EmptyCatalog } from '../components/States';

const SORTS = [
  { value: 'popular', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'All';
  const { wishlist } = useShop();

  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('popular');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [quick, setQuick] = useState(null);

  const load = () => {
    setError('');
    setProducts(null);
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const lo = min === '' ? 0 : Number(min);
    const hi = max === '' ? Infinity : Number(max);
    let list = products.filter((p) => {
      const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      return (
        tokens.every((t) => hay.includes(t)) &&
        (category === 'All' || p.category === category) &&
        p.price >= lo &&
        p.price <= hi &&
        (!savedOnly || wishlist.includes(p.id)) &&
        (!inStockOnly || p.stock > 0)
      );
    });
    const by = {
      popular: (a, b) => b.reviews - a.reviews,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
    }[sort];
    list = [...list].sort(by);
    return list;
  }, [products, q, category, min, max, sort, savedOnly, inStockOnly, wishlist]);

  const activeFilters = Boolean(q || category !== 'All' || min || max || savedOnly || inStockOnly);
  const clearAll = () => {
    setParams({}, { replace: true });
    setMin('');
    setMax('');
    setSavedOnly(false);
    setInStockOnly(false);
  };

  return (
    <div className="container page-pad">
      <header className="page-head">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>{category === 'All' ? 'All products' : category}</h1>
          <p className="muted">
            {products ? `${filtered.length} product${filtered.length === 1 ? '' : 's'}` : 'Loading products…'}
            {q && (
              <>
                {' '}
                for “<b>{q}</b>”
              </>
            )}
          </p>
        </div>
        <div className="shop-tools">
          <label className="search-field">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
            />
            {q && (
              <button type="button" onClick={() => setParam('q', '')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
          <button className="btn btn-ghost filter-toggle" onClick={() => setShowFilters((s) => !s)}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </header>

      <div className="chips" role="tablist" aria-label="Categories">
        {['All', ...CATEGORIES.map((c) => c.name)].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => setParam('category', c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="shop-layout">
        <aside className={`filters ${showFilters ? 'show' : ''}`}>
          <h4>Price range</h4>
          <div className="price-inputs">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min ₹"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              aria-label="Minimum price"
            />
            <span>–</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max ₹"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              aria-label="Maximum price"
            />
          </div>
          <div className="price-presets">
            {[
              ['Under ₹5K', '', 5000],
              ['₹5K–25K', 5000, 25000],
              ['₹25K–75K', 25000, 75000],
              ['₹75K+', 75000, ''],
            ].map(([label, lo, hi]) => (
              <button
                key={label}
                className={`chip small ${String(min) === String(lo) && String(max) === String(hi) ? 'active' : ''}`}
                onClick={() => {
                  setMin(lo === '' ? '' : String(lo));
                  setMax(hi === '' ? '' : String(hi));
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <h4>Availability</h4>
          <label className="check">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            In stock only
          </label>
          <label className="check">
            <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
            <Heart size={14} /> Saved items ({wishlist.length})
          </label>

          {activeFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              <X size={14} /> Clear all filters
            </button>
          )}
        </aside>

        <section className="shop-results" aria-live="polite">
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : !products ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <EmptyCatalog onLoaded={load} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No products found"
              text="Try a different search, widen the price range or clear your filters."
              action={
                <button className="btn btn-dark" onClick={clearAll}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid-products">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuick} />
              ))}
            </div>
          )}
        </section>
      </div>

      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </div>
  );
}
