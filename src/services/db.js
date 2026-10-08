import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  writeBatch,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { SEED_PRODUCTS, SEED_POLICIES, buildDemoData } from '../data/seed';
import { DELIVERY_FEE, FREE_SHIPPING, toDate, addDays } from '../lib/format';

const need = () => {
  if (!db) throw new Error('Firebase is not configured yet. Add your keys to a .env file (see README).');
  return db;
};

const withId = (d) => ({ id: d.id, ...d.data() });
const newest = (key) => (a, b) => (toDate(b[key])?.getTime() || 0) - (toDate(a[key])?.getTime() || 0);

// ----------------------------------------------------------------- catalogue
export async function fetchProducts() {
  const snap = await getDocs(collection(need(), 'products'));
  return snap.docs.map(withId);
}

export async function fetchProduct(id) {
  const snap = await getDoc(doc(need(), 'products', id));
  return snap.exists() ? withId(snap) : null;
}

export async function fetchPolicies() {
  const snap = await getDocs(collection(need(), 'policies'));
  return snap.docs.map(withId);
}

// -------------------------------------------------------------------- orders
export async function fetchOrders(uid) {
  const snap = await getDocs(query(collection(need(), 'orders'), where('userId', '==', uid)));
  return snap.docs.map(withId).sort(newest('orderDate'));
}

export async function fetchReturns(uid) {
  const snap = await getDocs(query(collection(need(), 'returns'), where('userId', '==', uid)));
  return snap.docs.map(withId).sort(newest('createdAt'));
}

export async function placeOrder({ user, items, paymentMethod, address }) {
  const database = need();

  // Re-check live stock so two customers can't buy the last unit.
  const fresh = await Promise.all(items.map((i) => getDoc(doc(database, 'products', i.id))));
  fresh.forEach((snap, idx) => {
    const it = items[idx];
    if (!snap.exists()) throw new Error(`${it.name} is no longer available.`);
    const stock = snap.data().stock ?? 0;
    if (stock < it.qty) throw new Error(stock <= 0 ? `${it.name} is out of stock.` : `Only ${stock} left of ${it.name}.`);
  });

  const lines = items.map((i) => ({
    productId: i.id,
    name: i.name,
    image: i.image,
    price: i.price,
    quantity: i.qty,
  }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const deliveryFee = subtotal >= FREE_SHIPPING ? 0 : DELIVERY_FEE;
  const orderId = `SA-${Date.now().toString().slice(-6)}`;

  const batch = writeBatch(database);
  batch.set(doc(database, 'orders', orderId), {
    userId: user.uid,
    products: lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    orderDate: Timestamp.now(),
    deliveryDate: Timestamp.fromDate(addDays(5)),
    status: 'Processing',
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
    paymentMethod,
    address,
  });
  lines.forEach((l) => batch.update(doc(database, 'products', l.productId), { stock: increment(-l.quantity) }));
  await batch.commit();
  return orderId;
}

export async function cancelOrder(order) {
  const database = need();
  const batch = writeBatch(database);
  batch.update(doc(database, 'orders', order.id), {
    status: 'Cancelled',
    paymentStatus: order.paymentStatus === 'Paid' ? 'Refund Initiated' : 'Not charged',
  });
  order.products.forEach((l) =>
    batch.update(doc(database, 'products', l.productId), { stock: increment(l.quantity) })
  );
  await batch.commit();
}

export async function requestReturn({ order, user, reason, note }) {
  const id = `RET-${Date.now().toString().slice(-6)}`;
  await setDoc(doc(need(), 'returns', id), {
    orderId: order.id,
    userId: user.uid,
    reason,
    note: note || '',
    status: 'Requested',
    createdAt: Timestamp.now(),
    items: order.products.map((p) => p.name),
  });
  return id;
}

// ------------------------------------------------------------------- seeding
export async function seedCatalogIfEmpty() {
  const database = need();
  const probe = await getDocs(query(collection(database, 'products'), limit(1)));
  if (!probe.empty) return false;
  const batch = writeBatch(database);
  SEED_PRODUCTS.forEach(({ id, ...data }) => batch.set(doc(database, 'products', id), data));
  SEED_POLICIES.forEach(({ id, ...data }) => batch.set(doc(database, 'policies', id), data));
  await batch.commit();
  return true;
}

export async function ensureDemoData(uid, key) {
  const database = need();
  await seedCatalogIfEmpty();
  const existing = await getDocs(
    query(collection(database, 'orders'), where('userId', '==', uid), limit(1))
  );
  if (!existing.empty) return;
  const { orders, returns } = buildDemoData(uid, key);
  const batch = writeBatch(database);
  orders.forEach(([id, data]) => batch.set(doc(database, 'orders', id), data));
  returns.forEach(([id, data]) => batch.set(doc(database, 'returns', id), data));
  await batch.commit();
}
