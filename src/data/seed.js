import { Timestamp } from 'firebase/firestore';
import { FREE_SHIPPING, DELIVERY_FEE } from '../lib/format';

// ---------------------------------------------------------------------------
// Demo seed data. This file is NOT imported by any UI component — it is only
// used by services/db.js to populate Firestore on first demo sign-in.
// ---------------------------------------------------------------------------

const ph = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const POOL = {
  Electronics: ['1511707171634-5f897ff02aa9', '1561154464-82e9adf32764', '1589492477829-5e65395b66cc'],
  Audio: ['1505740420928-5e560c06d30e', '1590658268037-6bf12165a8df', '1608043152269-423dbba4e7e1', '1484704849700-f032a568e944'],
  Wearables: ['1546868871-7041f2a55e12', '1575311373937-040b8e1fd5b6', '1523275335684-37898b6baf30', '1434493789847-2f02dc6ca35d'],
  Laptops: ['1517336714731-489689fd1ca8', '1593642632823-8f785ba67e45', '1496181133206-80ce9b88a853'],
  Accessories: ['1553062407-98eeb64c6a62', '1586816879360-004f5b0c51e5', '1587829741301-dc798b83add3', '1527864550417-7fd91fc51a46'],
  Cameras: ['1516035069371-29a1b244cc32', '1526170375885-4d8ecf77b99f', '1502920917128-1aa500764cbd'],
  Fashion: ['1542291026-7eec264c27ff', '1551028719-00167b16eac5', '1572635196237-14b3f281503f', '1491553895911-0055eca6402d'],
};

const make = (n, name, category, main, price, oldPrice, rating, reviews, stock, badge, description, specifications) => ({
  id: `p-${String(n).padStart(2, '0')}`,
  name,
  category,
  description,
  price,
  oldPrice,
  image: ph(main),
  images: [main, ...POOL[category].filter((x) => x !== main)].slice(0, 3).map(ph),
  rating,
  reviews,
  stock,
  badge,
  specifications,
});

export const SEED_PRODUCTS = [
  make(1, 'Nova X Pro 5G Smartphone', 'Electronics', '1511707171634-5f897ff02aa9', 54999, 64999, 4.7, 2184, 24, 'Best Seller',
    'A flagship 5G phone with a 120Hz AMOLED display, a 50MP triple camera and all-day battery life with 67W fast charging.',
    { Display: '6.7" AMOLED, 120Hz', Processor: 'Octa-core 4nm', Memory: '12GB RAM / 256GB', Camera: '50MP + 12MP + 10MP', Battery: '5000mAh, 67W charging' }),
  make(2, 'Lumen Tab 11 Tablet', 'Electronics', '1561154464-82e9adf32764', 29999, 34999, 4.5, 1320, 12, 'New',
    'An 11-inch tablet with a crisp 2K display and quad speakers, built for streaming, sketching and note-taking.',
    { Display: '11" 2K LCD, 90Hz', Storage: '128GB', Battery: '8000mAh', Connectivity: 'Wi-Fi 6, Bluetooth 5.3', Weight: '480g' }),
  make(3, 'Echo Home Smart Speaker', 'Electronics', '1589492477829-5e65395b66cc', 4999, 6999, 4.4, 3920, 60, null,
    'A compact smart speaker with room-filling sound, a built-in voice assistant and smart-home controls.',
    { Drivers: '360° woofer + tweeter', Assistant: 'Built-in voice assistant', Connectivity: 'Wi-Fi, Bluetooth 5.0', Power: '15W AC adapter', Colour: 'Charcoal' }),

  make(4, 'Sonic Pro X1 Wireless Headphones', 'Audio', '1505740420928-5e560c06d30e', 12999, 18999, 4.8, 5421, 35, 'Best Seller',
    'Over-ear headphones with hybrid active noise cancellation, 40-hour battery life and plush memory-foam cushions.',
    { Type: 'Over-ear, wireless', Noise_Cancelling: 'Hybrid ANC', Battery: '40 hours', Charging: 'USB-C, 10 min = 5 hrs', Connectivity: 'Bluetooth 5.3, multipoint' }),
  make(5, 'AirPulse Buds ANC', 'Audio', '1590658268037-6bf12165a8df', 5499, 7999, 4.6, 8210, 80, 'Trending',
    'True wireless earbuds with active noise cancellation, transparency mode and an IPX5 sweat-resistant fit.',
    { Type: 'In-ear, true wireless', Noise_Cancelling: 'Active ANC', Battery: '8h buds + 24h case', Water_Resistance: 'IPX5', Connectivity: 'Bluetooth 5.3' }),
  make(6, 'Boom Mini Bluetooth Speaker', 'Audio', '1608043152269-423dbba4e7e1', 2999, 3999, 4.3, 2210, 0, null,
    'A pocket-sized waterproof speaker with surprisingly deep bass and 12 hours of playtime.',
    { Output: '10W', Battery: '12 hours', Water_Resistance: 'IPX7', Connectivity: 'Bluetooth 5.1', Weight: '320g' }),

  make(7, 'Pulse Watch Series 5', 'Wearables', '1546868871-7041f2a55e12', 17999, 21999, 4.6, 3150, 22, 'New',
    'A premium smartwatch with GPS, ECG, blood-oxygen tracking and a bright always-on AMOLED display.',
    { Display: '1.9" AMOLED always-on', Sensors: 'ECG, SpO2, heart rate, GPS', Battery: '7 days', Water_Resistance: '5 ATM', Compatibility: 'Android & iOS' }),
  make(8, 'Fit Band 7 Fitness Tracker', 'Wearables', '1575311373937-040b8e1fd5b6', 2499, 3499, 4.2, 9870, 120, 'Value Pick',
    'A lightweight fitness band with heart-rate and sleep tracking, 100+ workout modes and a 14-day battery.',
    { Display: '1.47" AMOLED', Battery: '14 days', Water_Resistance: '5 ATM', Sensors: 'Heart rate, SpO2, sleep', Weight: '27g' }),
  make(9, 'Classic Chrono Leather Smartwatch', 'Wearables', '1523275335684-37898b6baf30', 9999, 14999, 4.5, 1480, 15, null,
    'A hybrid smartwatch that pairs a classic analogue look with notifications, step tracking and a genuine leather strap.',
    { Case: '42mm stainless steel', Strap: 'Genuine leather', Battery: '10 days', Water_Resistance: '3 ATM', Features: 'Notifications, steps, sleep' }),

  make(10, 'AeroBook Air 14 Laptop', 'Laptops', '1517336714731-489689fd1ca8', 84999, 94999, 4.8, 1740, 9, "Editor's Choice",
    'An ultra-thin 14-inch laptop with a 2.8K OLED display, 18-hour battery life and a fanless, silent design.',
    { Display: '14" 2.8K OLED', Processor: 'Latest-gen 8-core', Memory: '16GB RAM / 512GB SSD', Battery: 'Up to 18 hours', Weight: '1.24 kg' }),
  make(11, 'Forge G15 Gaming Laptop', 'Laptops', '1593642632823-8f785ba67e45', 99999, 119999, 4.6, 960, 6, 'Limited',
    'A 15.6-inch gaming laptop with a 165Hz display, dedicated RTX graphics and a vapour-chamber cooling system.',
    { Display: '15.6" FHD, 165Hz', Graphics: 'RTX 4060 8GB', Memory: '16GB DDR5 / 1TB SSD', Cooling: 'Vapour chamber', Weight: '2.2 kg' }),
  make(12, 'WorkMate 15 Business Laptop', 'Laptops', '1496181133206-80ce9b88a853', 54999, 62999, 4.4, 1120, 18, null,
    'A dependable 15-inch business laptop with a backlit keyboard, fingerprint reader and a full port selection.',
    { Display: '15.6" FHD IPS', Memory: '16GB RAM / 512GB SSD', Security: 'Fingerprint + TPM 2.0', Ports: 'USB-C, 2×USB-A, HDMI', Weight: '1.7 kg' }),

  make(13, 'Urban Commuter Backpack 25L', 'Accessories', '1553062407-98eeb64c6a62', 2499, 3999, 4.5, 4300, 70, null,
    'A water-resistant 25L backpack with a padded laptop sleeve, anti-theft pocket and a USB charging pass-through.',
    { Capacity: '25 litres', Laptop_Fit: 'Up to 16"', Material: 'Water-resistant polyester', Pockets: '9 compartments', Weight: '890g' }),
  make(14, 'MagSlim 15W Wireless Charger', 'Accessories', '1586816879360-004f5b0c51e5', 1499, 2299, 4.3, 2650, 150, null,
    'A slim magnetic wireless charging pad with 15W fast charging and a non-slip surface.',
    { Output: '15W max', Compatibility: 'Qi-enabled phones', Input: 'USB-C', Cable: '1.2m braided', Safety: 'Overheat protection' }),
  make(15, 'Click Pro Mechanical Keyboard', 'Accessories', '1587829741301-dc798b83add3', 6499, 8499, 4.7, 2890, 40, 'Best Seller',
    'A compact hot-swappable mechanical keyboard with tactile switches, RGB lighting and Bluetooth + USB-C connectivity.',
    { Layout: '75% compact', Switches: 'Hot-swappable tactile', Connectivity: 'Bluetooth 5.1 / USB-C', Battery: '4000mAh', Backlight: 'Per-key RGB' }),

  make(16, 'Orion M50 Mirrorless Camera', 'Cameras', '1516035069371-29a1b244cc32', 64999, 74999, 4.7, 740, 7, 'Pro',
    'A 24MP mirrorless camera with fast hybrid autofocus, 4K video and in-body stabilisation, supplied with a kit lens.',
    { Sensor: '24.2MP APS-C', Video: '4K 30p', Stabilisation: '5-axis in-body', Screen: '3" vari-angle touch', Kit_Lens: '18-55mm f/3.5-5.6' }),
  make(17, 'SnapGo 4K Action Camera', 'Cameras', '1526170375885-4d8ecf77b99f', 14999, 19999, 4.5, 1950, 30, 'Trending',
    'A rugged action camera with 4K 60fps video, horizon-levelling stabilisation and waterproofing to 10 metres.',
    { Video: '4K 60fps', Stabilisation: 'Electronic + horizon lock', Waterproof: '10m without case', Battery: '1700mAh', Screen: 'Dual displays' }),
  make(18, 'Retro Instant Camera Mini', 'Cameras', '1502920917128-1aa500764cbd', 7499, 9499, 4.4, 1210, 25, null,
    'A fun instant camera with a built-in flash, selfie mirror and credit-card-sized prints in under a minute.',
    { Film: 'Instant mini', Flash: 'Auto flash', Lens: '60mm f/12.7', Power: '2×AA', Extras: 'Selfie mirror' }),

  make(19, 'Street Runner Sneakers', 'Fashion', '1542291026-7eec264c27ff', 3999, 6999, 4.5, 6120, 55, 'Trending',
    'Lightweight everyday sneakers with a breathable knit upper and a cushioned, high-grip sole.',
    { Upper: 'Breathable knit', Sole: 'EVA cushioned rubber', Fit: 'True to size', Sizes: 'UK 6–11', Care: 'Wipe clean' }),
  make(20, 'Heritage Denim Jacket', 'Fashion', '1551028719-00167b16eac5', 3499, 5499, 4.4, 2130, 28, null,
    'A timeless regular-fit denim jacket in washed indigo, made from soft, durable cotton.',
    { Material: '100% cotton denim', Fit: 'Regular', Sizes: 'S–XXL', Wash: 'Washed indigo', Care: 'Machine wash cold' }),
  make(21, 'Aviator Polarized Sunglasses', 'Fashion', '1572635196237-14b3f281503f', 1999, 3499, 4.3, 3340, 90, 'Value Pick',
    'Classic metal-frame aviators with polarised lenses and 100% UV400 protection.',
    { Lens: 'Polarised, UV400', Frame: 'Lightweight metal', Width: '58mm', Includes: 'Hard case + cloth', Warranty: '6 months' }),
];

export const SEED_POLICIES = [
  {
    id: 'returns',
    title: 'Returns & Refunds',
    content:
      'You can request a return within 10 days of delivery for most products. Items must be unused and in original packaging with all accessories. Once your return is picked up and inspected, the refund is issued to the original payment method within 5–7 business days. Cash-on-delivery orders are refunded by bank transfer. Opened personal-care and innerwear items cannot be returned.',
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    content:
      'Delivery is free on orders of ₹999 and above; a flat ₹79 fee applies below that. Most orders are delivered in 3–5 business days. You will see live tracking on the Orders page: Processing, Shipped, Out for Delivery and Delivered.',
  },
  {
    id: 'payments',
    title: 'Payments',
    content:
      'We accept UPI, debit and credit cards, and Cash on Delivery for orders up to ₹20,000. Card and UPI payments are marked Paid at checkout. Cash on Delivery orders show Pending until the parcel is delivered. Failed payments are automatically refunded within 3 business days.',
  },
  {
    id: 'cancellation',
    title: 'Order Cancellation',
    content:
      'You can cancel an order any time before it is shipped from the Orders page. Prepaid orders are refunded within 3–5 business days of cancellation. Once an order has shipped, you can refuse delivery or request a return after it arrives.',
  },
  {
    id: 'warranty',
    title: 'Warranty & Support',
    content:
      'Electronics, laptops, wearables and cameras carry a 1-year manufacturer warranty. Keep your order confirmation as proof of purchase. For help with an order, ask ShopAssist AI any time or write to support@shopassist.demo.',
  },
];

export const DEMO_USERS = {
  rahul: {
    key: 'rahul',
    name: 'Rahul Sharma',
    email: 'rahul@shopassist.demo',
    password: 'ShopAssist@123',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=6d5efc&color=fff&bold=true',
    tagline: '3 active orders · 1 delivered',
  },
  priya: {
    key: 'priya',
    name: 'Priya Patel',
    email: 'priya@shopassist.demo',
    password: 'ShopAssist@123',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=ec4899&color=fff&bold=true',
    tagline: 'Out for delivery · 1 refunded return',
  },
};

// ---------------------------------------------------------------------------
// Demo orders / returns, generated relative to "now" so the timeline always
// looks fresh (e.g. a delivered order is always still inside the return window).
// ---------------------------------------------------------------------------

const P = Object.fromEntries(SEED_PRODUCTS.map((p) => [p.id, p]));
const at = (days) => Timestamp.fromDate(new Date(Date.now() + days * 864e5));
const line = (id, quantity = 1) => ({
  productId: id,
  name: P[id].name,
  image: P[id].image,
  price: P[id].price,
  quantity,
});

const order = (id, userId, items, orderDay, deliveryDay, status, paymentStatus, paymentMethod, address) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_SHIPPING ? 0 : DELIVERY_FEE;
  return [
    id,
    {
      userId,
      products: items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      orderDate: at(orderDay),
      deliveryDate: at(deliveryDay),
      status,
      paymentStatus,
      paymentMethod,
      address,
    },
  ];
};

export function buildDemoData(uid, key) {
  if (key === 'rahul') {
    const addr = { name: 'Rahul Sharma', phone: '9876543210', line: '12, Lotus Residency, MG Road', city: 'Indore', pincode: '452001' };
    return {
      orders: [
        order('SA-20481', uid, [line('p-04'), line('p-14')], -9, -4, 'Delivered', 'Paid', 'UPI', addr),
        order('SA-20517', uid, [line('p-07')], -3, 2, 'Shipped', 'Paid', 'Card', addr),
        order('SA-20533', uid, [line('p-15'), line('p-13')], -1, 5, 'Processing', 'Pending', 'Cash on Delivery', addr),
        order('SA-20390', uid, [line('p-19')], -32, -27, 'Delivered', 'Paid', 'UPI', addr),
      ],
      returns: [],
    };
  }
  const addr = { name: 'Priya Patel', phone: '9123456780', line: '45, Green Park Colony, Arera Hills', city: 'Bhopal', pincode: '462011' };
  return {
    orders: [
      order('SA-30112', uid, [line('p-05'), line('p-21')], -4, 0, 'Out for Delivery', 'Paid', 'UPI', addr),
      order('SA-30077', uid, [line('p-10')], -8, -3, 'Delivered', 'Paid', 'Card', addr),
      order('SA-30140', uid, [line('p-17')], 0, 6, 'Processing', 'Paid', 'UPI', addr),
      order('SA-30021', uid, [line('p-20')], -22, -17, 'Delivered', 'Refunded', 'Card', addr),
    ],
    returns: [
      [
        'RET-5001',
        {
          orderId: 'SA-30021',
          userId: uid,
          reason: 'Size / fit issue',
          note: 'Jacket runs small, would like a refund.',
          status: 'Refunded',
          createdAt: at(-14),
          items: [P['p-20'].name],
        },
      ],
    ],
  };
}
