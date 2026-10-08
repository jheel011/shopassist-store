import { Smartphone, Shirt, Headphones, Watch, Laptop, Briefcase, Camera } from 'lucide-react';

export const CATEGORIES = [
  { name: 'Electronics', icon: Smartphone, from: '#e0e7ff', to: '#c7d2fe', blurb: 'Phones, tablets & smart home' },
  { name: 'Fashion', icon: Shirt, from: '#fce7f3', to: '#fbcfe8', blurb: 'Sneakers, jackets & eyewear' },
  { name: 'Audio', icon: Headphones, from: '#ede9fe', to: '#ddd6fe', blurb: 'Headphones, buds & speakers' },
  { name: 'Wearables', icon: Watch, from: '#dcfce7', to: '#bbf7d0', blurb: 'Smartwatches & fitness bands' },
  { name: 'Laptops', icon: Laptop, from: '#e0f2fe', to: '#bae6fd', blurb: 'Work, study & gaming' },
  { name: 'Accessories', icon: Briefcase, from: '#fef3c7', to: '#fde68a', blurb: 'Bags, chargers & peripherals' },
  { name: 'Cameras', icon: Camera, from: '#ffedd5', to: '#fed7aa', blurb: 'Mirrorless, action & instant' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.name, c]));
