/* eslint-disable no-console */
// Idempotent seed for Fashion House.
//   node scripts/seed.js   (or `npm run seed`)
// Creates categories, a fashion catalog (variants / stock / images / Kyat prices),
// an admin account and a demo customer. Re-running only adds what is missing, so
// stock changes from real orders are never overwritten.
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const categories = [
  { categoryName: 'Men', slug: 'men', description: 'Tailored essentials and modern menswear.' },
  { categoryName: 'Women', slug: 'women', description: 'Contemporary womenswear and ready-to-wear.' },
  { categoryName: 'Footwear', slug: 'footwear', description: 'Boots, sneakers and everyday shoes.' },
  { categoryName: 'Accessories', slug: 'accessories', description: 'Caps, eyewear and finishing touches.' },
  { categoryName: 'Bags', slug: 'bags', description: 'Leather goods and structured carry.' },
  { categoryName: 'Watches', slug: 'watches', description: 'Timepieces for every occasion.' },
];

// sizes: apparel S–XL, footwear EU 40–44, one-size for accessories.
const apparel = (colors, stock = 24) =>
  ['S', 'M', 'L', 'XL'].flatMap((size, si) =>
    colors.map((color, ci) => ({
      sku: `${size}-${color}`.toUpperCase().replace(/\s+/g, '-'),
      size,
      color,
      stock: Math.max(0, stock - si * 3 - ci * 2),
      additionalPrice: size === 'XL' ? 3000 : 0,
    }))
  );

const shoes = (colors, stock = 18) =>
  ['40', '41', '42', '43', '44'].flatMap((size, si) =>
    colors.map((color, ci) => ({
      sku: `${size}-${color}`.toUpperCase().replace(/\s+/g, '-'),
      size,
      color,
      stock: Math.max(0, stock - si * 2 - ci),
      additionalPrice: 0,
    }))
  );

const oneSize = (colors, stock = 30) =>
  colors.map((color, ci) => ({
    sku: `OS-${color}`.toUpperCase().replace(/\s+/g, '-'),
    size: 'One Size',
    color,
    stock: Math.max(0, stock - ci * 4),
    additionalPrice: 0,
  }));

const products = [
  {
    category: 'men', productName: 'Merino Wool Overcoat', slug: 'merino-wool-overcoat', brand: 'Atelier Nord',
    price: 185000, isFeatured: true,
    description: 'A double-faced merino wool overcoat with a clean, unstructured shoulder and horn buttons. Cut for a relaxed, layered fit that moves from office to evening.',
    images: [img('1591047139829-d91aecb6caea'), img('1544022613-e87ca75a784a')],
    variants: apparel(['Charcoal', 'Camel'], 20),
  },
  {
    category: 'men', productName: 'Oxford Cotton Shirt', slug: 'oxford-cotton-shirt', brand: 'Atelier Nord',
    price: 45000, isFeatured: true,
    description: 'Heavyweight organic oxford cotton with a button-down collar and a single chest pocket. Garment-washed for a soft, lived-in hand feel.',
    images: [img('1602810318383-e386cc2a3ccf'), img('1596755094514-f87e34085b2c')],
    variants: apparel(['White', 'Sky Blue'], 30),
  },
  {
    category: 'men', productName: 'Selvedge Denim Jacket', slug: 'selvedge-denim-jacket', brand: 'Iron & Thread',
    price: 98000, isFeatured: false,
    description: 'A type-III trucker jacket in 14oz Japanese selvedge denim that fades beautifully with wear. Copper rivets and chain-stitched hems.',
    images: [img('1551537482-f2075a1d41f2'), img('1543076447-215ad9ba6923')],
    variants: apparel(['Indigo', 'Washed Black'], 16),
  },
  {
    category: 'women', productName: 'Silk Slip Dress', slug: 'silk-slip-dress', brand: 'Maison Lune',
    price: 120000, isFeatured: true,
    description: 'A bias-cut slip dress in sand-washed mulberry silk with adjustable straps and a fluid cowl back. Effortless on its own or layered.',
    images: [img('1595777457583-95e059d581b8'), img('1566174053879-31528523f8ae')],
    variants: apparel(['Champagne', 'Black'], 18),
  },
  {
    category: 'women', productName: 'Cashmere Knit Sweater', slug: 'cashmere-knit-sweater', brand: 'Maison Lune',
    price: 88000, isFeatured: true,
    description: 'Grade-A Mongolian cashmere in a relaxed crew neck. Lightweight yet warm, with ribbed trims and a slightly cropped body.',
    images: [img('1576566588028-4147f3842f27'), img('1434389677669-e08b4cac3105')],
    variants: apparel(['Oat', 'Rosewood', 'Forest'], 22),
  },
  {
    category: 'women', productName: 'Pleated Midi Skirt', slug: 'pleated-midi-skirt', brand: 'Maison Lune',
    price: 62000, isFeatured: false,
    description: 'Sunray pleats in a fluid crepe that catches the light with every step. Elasticated waist and a graceful midi length.',
    images: [img('1583496661160-fb5886a0aaaa'), img('1551163943-3f6a855d1153')],
    variants: apparel(['Slate', 'Ivory'], 14),
  },
  {
    category: 'footwear', productName: 'Leather Chelsea Boots', slug: 'leather-chelsea-boots', brand: 'Steppe & Co',
    price: 150000, isFeatured: true,
    description: 'Full-grain leather Chelsea boots with elastic side gores and a stacked leather heel. Goodyear-welted for years of resoling.',
    images: [img('1638247025967-b4e38f787b76'), img('1608256246200-53e635b5b65f')],
    variants: shoes(['Tan', 'Black'], 16),
  },
  {
    category: 'footwear', productName: 'Retro Runner Sneakers', slug: 'retro-runner-sneakers', brand: 'Steppe & Co',
    price: 95000, isFeatured: true,
    description: 'A 70s-inspired runner with a suede-and-mesh upper, gum rubber outsole and cushioned EVA midsole. Everyday comfort with vintage character.',
    images: [img('1542291026-7eec264c27ff'), img('1525966222134-fcfa99b8ae77')],
    variants: shoes(['Red', 'Navy'], 24),
  },
  {
    category: 'footwear', productName: 'Canvas Low Sneakers', slug: 'canvas-low-sneakers', brand: 'Steppe & Co',
    price: 55000, isFeatured: false,
    description: 'A clean low-top in organic canvas with a vulcanised rubber sole and metal eyelets. The everyday staple, rebuilt to last.',
    images: [img('1525966222134-fcfa99b8ae77'), img('1460353581641-37baddab0fa2')],
    variants: shoes(['White', 'Black'], 26),
  },
  {
    category: 'accessories', productName: 'Aviator Sunglasses', slug: 'aviator-sunglasses', brand: 'Solstice',
    price: 38000, isFeatured: false,
    description: 'Classic aviator frames in lightweight gold-tone metal with polarised, UV400 gradient lenses. Includes a hard case and cloth.',
    images: [img('1511499767150-a48a237f0083'), img('1572635196237-14b3f281503f')],
    variants: oneSize(['Gold/Green', 'Silver/Grey'], 28),
  },
  {
    category: 'accessories', productName: 'Snapback Cap', slug: 'snapback-cap', brand: 'Solstice',
    price: 30000, isFeatured: false,
    description: 'A structured six-panel snapback in brushed cotton twill with a flat brim and embroidered eyelets. Adjustable snap closure.',
    images: [img('1588850561407-ed78c282e89b'), img('1521369909029-2afed882baee')],
    variants: oneSize(['Black', 'Sand'], 8), // low stock for admin dashboard
  },
  {
    category: 'bags', productName: 'Structured Leather Tote', slug: 'structured-leather-tote', brand: 'Carry Atelier',
    price: 135000, isFeatured: true,
    description: 'A structured tote in vegetable-tanned leather with a suede-lined interior, laptop sleeve and magnetic closure. Ages into a rich patina.',
    images: [img('1548036328-c9fa89d128fa'), img('1590874103328-eac38a683ce7')],
    variants: oneSize(['Cognac', 'Black'], 15),
  },
  {
    category: 'watches', productName: 'Minimalist Quartz Watch', slug: 'minimalist-quartz-watch', brand: 'Meridian',
    price: 210000, isFeatured: true,
    description: 'A 38mm minimalist dial with sapphire crystal, Japanese quartz movement and an interchangeable Italian leather strap. 5ATM water resistance.',
    images: [img('1523275335684-37898b6baf30'), img('1524592094714-0f0654e20314')],
    variants: oneSize(['Silver/Black', 'Gold/Brown'], 12),
  },
  {
    category: 'watches', productName: 'Analog Chronograph', slug: 'analog-chronograph', brand: 'Meridian',
    price: 265000, isFeatured: false,
    description: 'A 42mm chronograph with a tachymeter bezel, three sub-dials and a stainless steel bracelet. Precision timing with a sport-luxe finish.',
    images: [img('1524592094714-0f0654e20314'), img('1522312346375-d1a52e2b99b3')],
    variants: oneSize(['Steel'], 6), // low stock
  },
];

const seed = async () => {
  await mongoose.connect(config.mongoUri);
  console.log(`Connected to ${config.mongoUri}`);

  // Categories (upsert by slug)
  const categoryBySlug = {};
  for (const c of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: { ...c, status: 'active' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryBySlug[c.slug] = doc._id;
  }
  console.log(`Categories ready: ${Object.keys(categoryBySlug).length}`);

  // Products (create only if missing, so order-driven stock changes survive)
  let created = 0;
  let skipped = 0;
  for (const p of products) {
    const exists = await Product.findOne({ slug: p.slug });
    if (exists) {
      skipped += 1;
      continue;
    }
    await Product.create({
      categoryId: categoryBySlug[p.category],
      productName: p.productName,
      slug: p.slug,
      description: p.description,
      brand: p.brand,
      price: p.price,
      variants: p.variants,
      images: p.images.map((url, i) => ({ url, isPrimary: i === 0, displayOrder: i })),
      status: 'active',
      isFeatured: p.isFeatured,
    });
    created += 1;
  }
  console.log(`Products created: ${created}, skipped (already present): ${skipped}`);

  // Accounts (create only if missing; pre-save hook hashes the password)
  const accounts = [
    { username: 'admin', email: 'admin@fashionhouse.com', password: 'Admin@12345', role: 'admin' },
    {
      username: 'demo',
      email: 'demo@fashionhouse.com',
      password: 'Demo@12345',
      role: 'customer',
      phone: '095551212',
      addresses: [
        {
          recipientName: 'Demo Customer',
          phone: '095551212',
          address: 'No. 123, 96th Street',
          township: 'Mayangone',
          city: 'Yangon',
          isDefault: true,
        },
      ],
    },
  ];

  for (const a of accounts) {
    const exists = await User.findOne({ email: a.email });
    if (exists) {
      console.log(`Account exists: ${a.email} (${a.role})`);
      continue;
    }
    const { password, ...rest } = a;
    await User.create({ ...rest, passwordHash: password });
    console.log(`Account created: ${a.email} (${a.role})`);
  }

  const totals = {
    categories: await Category.countDocuments(),
    products: await Product.countDocuments(),
    featured: await Product.countDocuments({ isFeatured: true }),
    users: await User.countDocuments(),
  };
  console.log('Seed complete:', JSON.stringify(totals));
  console.log('\nLogin credentials:');
  console.log('  Admin    -> admin@fashionhouse.com / Admin@12345');
  console.log('  Customer -> demo@fashionhouse.com / Demo@12345');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});