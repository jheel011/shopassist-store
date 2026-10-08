import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { FREE_SHIPPING, inr } from '../lib/format';
import ProductImage from '../components/ProductImage';
import { EmptyState } from '../components/States';

export function Summary({ totals, children }) {
  const toFree = Math.max(0, FREE_SHIPPING - totals.subtotal);
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      <div className="sum-row">
        <span>Subtotal ({totals.count} item{totals.count === 1 ? '' : 's'})</span>
        <span>{inr(totals.mrp)}</span>
      </div>
      <div className="sum-row green">
        <span>Discount</span>
        <span>− {inr(totals.discount)}</span>
      </div>
      <div className="sum-row">
        <span>Delivery fee</span>
        <span>{totals.delivery === 0 ? 'Free' : inr(totals.delivery)}</span>
      </div>
      <div className="sum-row total">
        <span>Total</span>
        <span>{inr(totals.total)}</span>
      </div>
      {totals.discount > 0 && <p className="save-note">You’re saving {inr(totals.discount)} on this order</p>}
      {toFree > 0 && totals.subtotal > 0 && (
        <p className="ship-note">
          <Truck size={15} /> Add {inr(toFree)} more for free delivery
        </p>
      )}
      {children}
    </aside>
  );
}

export default function Cart() {
  const { items, totals, setQty, remove, clear } = useShop();
  const toast = useToast();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page-pad">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          text="Looks like you haven’t added anything yet. Explore the catalogue to find something you’ll love."
          action={
            <Link to="/shop" className="btn btn-dark">
              Start shopping <ArrowRight size={16} />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page-pad">
      <header className="page-head">
        <div>
          <span className="eyebrow">Your bag</span>
          <h1>Shopping cart</h1>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            clear();
            toast.info('Cart cleared');
          }}
        >
          <Trash2 size={15} /> Clear cart
        </button>
      </header>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((i) => (
            <li key={i.id} className="cart-item">
              <Link to={`/product/${i.id}`} className="cart-img">
                <ProductImage src={i.image} alt={i.name} category={i.category} />
              </Link>
              <div className="cart-info">
                <span className="eyebrow">{i.category}</span>
                <Link to={`/product/${i.id}`} className="cart-name">
                  {i.name}
                </Link>
                <div className="price-row">
                  <b>{inr(i.price)}</b>
                  {i.oldPrice > i.price && <s>{inr(i.oldPrice)}</s>}
                </div>
                {i.qty >= i.stock && <span className="stock low-text">Maximum available quantity</span>}
              </div>
              <div className="cart-controls">
                <div className="qty">
                  <button onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} aria-label="Decrease quantity">
                    <Minus size={15} />
                  </button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.stock} aria-label="Increase quantity">
                    <Plus size={15} />
                  </button>
                </div>
                <b className="line-total">{inr(i.price * i.qty)}</b>
                <button
                  className="icon-btn danger"
                  onClick={() => {
                    remove(i.id);
                    toast.info(`${i.name} removed`);
                  }}
                  aria-label={`Remove ${i.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Summary totals={totals}>
          <button className="btn btn-primary btn-lg block" onClick={() => navigate('/checkout')}>
            <Lock size={17} /> Proceed to checkout
          </button>
          <Link to="/shop" className="link-center">
            Continue shopping
          </Link>
        </Summary>
      </div>
    </div>
  );
}
