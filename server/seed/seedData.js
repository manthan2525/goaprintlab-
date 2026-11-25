const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getUploadBaseDir, ensureDir } = require('../middleware/uploadMiddleware');

function buildProductSvg({ title, category, accent, secondary, shape }) {
  const shapes = {
    gear: `
      <circle cx="200" cy="145" r="56" fill="none" stroke="${accent}" stroke-width="14" stroke-dasharray="16 10"/>
      <circle cx="200" cy="145" r="36" fill="${secondary}" stroke="${accent}" stroke-width="4"/>
      <circle cx="200" cy="145" r="14" fill="#0f172a"/>
    `,
    planter: `
      <polygon points="145,100 255,100 238,195 162,195" fill="${secondary}" stroke="${accent}" stroke-width="4"/>
      <polygon points="145,100 200,130 255,100" fill="${accent}" opacity="0.35"/>
      <line x1="165" y1="135" x2="235" y2="135" stroke="${accent}" stroke-width="2" opacity="0.6"/>
      <line x1="170" y1="165" x2="230" y2="165" stroke="${accent}" stroke-width="2" opacity="0.6"/>
    `,
    enclosure: `
      <rect x="125" y="95" width="150" height="100" rx="12" fill="${secondary}" stroke="${accent}" stroke-width="4"/>
      <rect x="145" y="115" width="75" height="45" rx="6" fill="#0f172a" stroke="${accent}" stroke-width="2"/>
      <circle cx="245" cy="128" r="8" fill="${accent}"/>
      <circle cx="245" cy="152" r="8" fill="${accent}" opacity="0.5"/>
    `,
    lamp: `
      <polygon points="175,85 225,85 245,195 155,195" fill="${secondary}" stroke="${accent}" stroke-width="4"/>
      <ellipse cx="200" cy="85" rx="25" ry="8" fill="${accent}"/>
      <line x1="170" y1="125" x2="230" y2="125" stroke="${accent}" stroke-width="3"/>
      <line x1="164" y1="160" x2="236" y2="160" stroke="${accent}" stroke-width="3"/>
    `,
    stand: `
      <path d="M155,195 L185,195 L185,115 Q200,90 215,115 L215,195 L245,195" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="138" y="192" width="124" height="14" rx="7" fill="${secondary}" stroke="${accent}" stroke-width="3"/>
    `,
    villa: `
      <polygon points="130,145 200,90 270,145" fill="${accent}" opacity="0.85"/>
      <rect x="145" y="145" width="110" height="58" fill="${secondary}" stroke="${accent}" stroke-width="3"/>
      <rect x="186" y="165" width="28" height="38" fill="#0f172a"/>
      <rect x="158" y="160" width="18" height="18" fill="${accent}" opacity="0.6"/>
      <rect x="224" y="160" width="18" height="18" fill="${accent}" opacity="0.6"/>
    `,
    figurine: `
      <polygon points="200,82 240,122 225,192 175,192 160,122" fill="${secondary}" stroke="${accent}" stroke-width="4"/>
      <polyline points="160,122 200,145 240,122" fill="none" stroke="${accent}" stroke-width="3"/>
      <line x1="200" y1="82" x2="200" y2="192" stroke="${accent}" stroke-width="2" opacity="0.65"/>
    `,
    organizer: `
      <rect x="120" y="135" width="160" height="50" rx="10" fill="${secondary}" stroke="${accent}" stroke-width="4"/>
      <path d="M145,135 L145,108 M182,135 L182,102 M218,135 L218,102 M255,135 L255,108" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    `,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#334155" stroke-width="0.7" opacity="0.45"/>
    </pattern>
  </defs>
  <rect width="400" height="280" fill="url(#bg)"/>
  <rect width="400" height="280" fill="url(#grid)"/>
  <ellipse cx="200" cy="208" rx="95" ry="14" fill="#020617" opacity="0.55"/>
  ${shapes[shape] || shapes.gear}
  <rect x="20" y="20" width="112" height="24" rx="12" fill="${accent}" opacity="0.18" stroke="${accent}" stroke-width="1"/>
  <text x="76" y="36" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="600" fill="${accent}">${category.toUpperCase()}</text>
  <text x="200" y="252" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">${title}</text>
</svg>`;
}

function generateProductAssets() {
  const productsDir = path.join(getUploadBaseDir(), 'products');
  const modelsDir = path.join(getUploadBaseDir(), 'models');
  ensureDir(productsDir);
  ensureDir(modelsDir);

  const assetSpecs = [
    {
      filename: 'default-3d-product.svg',
      title: 'GoaPrintLab 3D Print',
      category: '3D Print',
      accent: '#38bdf8',
      secondary: '#1e3a5f',
      shape: 'figurine',
    },
    {
      filename: 'planetary-gear.svg',
      title: 'Planetary Gear Assembly',
      category: 'Prototypes',
      accent: '#38bdf8',
      secondary: '#1d4ed8',
      shape: 'gear',
    },
    {
      filename: 'voronoi-planter.svg',
      title: 'Voronoi Geometric Planter',
      category: 'Decor',
      accent: '#34d399',
      secondary: '#065f46',
      shape: 'planter',
    },
    {
      filename: 'pi-enclosure.svg',
      title: 'Raspberry Pi 5 Case',
      category: 'Gadgets',
      accent: '#f59e0b',
      secondary: '#78350f',
      shape: 'enclosure',
    },
    {
      filename: 'coastal-lamp.svg',
      title: 'Aguada Lighthouse Lamp',
      category: 'Decor',
      accent: '#fb7185',
      secondary: '#881337',
      shape: 'lamp',
    },
    {
      filename: 'headphone-stand.svg',
      title: 'Minimalist Headphone Stand',
      category: 'Gadgets',
      accent: '#a78bfa',
      secondary: '#4c1d95',
      shape: 'stand',
    },
    {
      filename: 'goan-villa-model.svg',
      title: 'Goan Heritage Villa Scale Model',
      category: 'Architectural',
      accent: '#fbbf24',
      secondary: '#713f12',
      shape: 'villa',
    },
    {
      filename: 'lowpoly-figurine.svg',
      title: 'Low-Poly Crystal Owl',
      category: 'Gifts',
      accent: '#2dd4bf',
      secondary: '#134e4a',
      shape: 'figurine',
    },
    {
      filename: 'cable-organizer.svg',
      title: 'Modular Desk Cable Dock',
      category: 'Gadgets',
      accent: '#60a5fa',
      secondary: '#1e3a8a',
      shape: 'organizer',
    },
  ];

  for (const spec of assetSpecs) {
    const filePath = path.join(productsDir, spec.filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, buildProductSvg(spec), 'utf8');
    }
  }
}

const SAMPLE_PRODUCTS = [
  {
    title: 'Planetary Gear Assembly Kit',
    category: 'Prototypes',
    description:
      'Precision-printed 3D planetary gear mechanism engineered for mechanical engineering demonstrations, robotics prototypes, and smooth torque transmission.',
    basePrice: 649,
    materials: ['PLA', 'PETG', 'ABS'],
    colors: ['Matte Black', 'Ocean Blue', 'Slate Grey', 'Sunset Orange'],
    sizes: ['Small', 'Medium', 'Large'],
    images: ['/uploads/products/planetary-gear.svg'],
    inStock: true,
  },
  {
    title: 'Voronoi Geometric Planter',
    category: 'Decor',
    description:
      'Modern architectural indoor succulent planter with breathable Voronoi lattice styling and integrated drip saucer.',
    basePrice: 449,
    materials: ['PLA', 'PETG'],
    colors: ['Arctic White', 'Emerald Green', 'Terracotta', 'Matte Black'],
    sizes: ['Small', 'Medium', 'Large'],
    images: ['/uploads/products/voronoi-planter.svg'],
    inStock: true,
  },
  {
    title: 'Raspberry Pi 5 Vented Enclosure',
    category: 'Gadgets',
    description:
      'Snap-fit protective enclosure featuring precision GPIO cutouts, passive airflow slots, and 40mm fan mounting points.',
    basePrice: 399,
    materials: ['PETG', 'ABS', 'PLA'],
    colors: ['Matte Black', 'Carbon Grey', 'Ocean Blue'],
    sizes: ['Small', 'Medium'],
    images: ['/uploads/products/pi-enclosure.svg'],
    inStock: true,
  },
  {
    title: 'Aguada Lighthouse Lithophane Lamp',
    category: 'Decor',
    description:
      'Inspired by Goa coastal heritage, this warm-glow textured lamp shade diffuses LED light through intricate layered contours.',
    basePrice: 899,
    materials: ['PLA', 'PETG'],
    colors: ['Warm Ivory', 'Arctic White', 'Coral Red'],
    sizes: ['Medium', 'Large'],
    images: ['/uploads/products/coastal-lamp.svg'],
    inStock: true,
  },
  {
    title: 'Minimalist Desk Headphone Stand',
    category: 'Gadgets',
    description:
      'Weighted-base ergonomic headphone cradle designed with reinforced infill and smooth curved headband support.',
    basePrice: 549,
    materials: ['PLA', 'PETG', 'ABS'],
    colors: ['Matte Black', 'Arctic White', 'Royal Purple'],
    sizes: ['Medium', 'Large'],
    images: ['/uploads/products/headphone-stand.svg'],
    inStock: true,
  },
  {
    title: 'Goan Heritage Villa Scale Model',
    category: 'Architectural',
    description:
      'Detailed architectural display model showcasing sloped tiled rooflines, portico pillars, and veranda balustrades for studio presentations.',
    basePrice: 1299,
    materials: ['PLA', 'Resin'],
    colors: ['Arctic White', 'Sandstone', 'Terracotta'],
    sizes: ['Small', 'Medium', 'Large'],
    images: ['/uploads/products/goan-villa-model.svg'],
    inStock: true,
  },
  {
    title: 'Low-Poly Crystal Owl Figurine',
    category: 'Gifts',
    description:
      'Faceted geometric desk sculpture printed with silky-finish filament, ideal for personalized gifts and study table accents.',
    basePrice: 349,
    materials: ['PLA', 'TPU'],
    colors: ['Teal Silk', 'Gold', 'Arctic White', 'Matte Black'],
    sizes: ['Small', 'Medium', 'Large'],
    images: ['/uploads/products/lowpoly-figurine.svg'],
    inStock: true,
  },
  {
    title: 'Modular Desk Cable Dock',
    category: 'Gadgets',
    description:
      'Four-slot anti-slip desk cable organizer engineered to keep USB-C, Lightning, and power cords neatly anchored.',
    basePrice: 249,
    materials: ['TPU', 'PLA', 'PETG'],
    colors: ['Matte Black', 'Ocean Blue', 'Sunset Orange'],
    sizes: ['Small', 'Medium'],
    images: ['/uploads/products/cable-organizer.svg'],
    inStock: true,
  },
];

async function seedIfEmpty() {
  generateProductAssets();

  let admin = await User.findOne({ email: 'admin@goaprintlab.in' });
  if (!admin) {
    admin = await User.create({
      name: 'GoaPrintLab Admin',
      email: 'admin@goaprintlab.in',
      password: 'Admin@123',
      phone: '+91 98220 00001',
      address: {
        street: '14 Miramar Innovation Hub',
        city: 'Panaji',
        state: 'Goa',
        pincode: '403001',
      },
      role: 'admin',
    });
  }

  let customer = await User.findOne({ email: 'customer@goaprintlab.in' });
  if (!customer) {
    customer = await User.create({
      name: 'Aarav Naik',
      email: 'customer@goaprintlab.in',
      password: 'Customer@123',
      phone: '+91 98221 45678',
      address: {
        street: '22 Dona Paula Road',
        city: 'Panaji',
        state: 'Goa',
        pincode: '403004',
      },
      role: 'customer',
    });
  }

  const productCount = await Product.countDocuments();
  let createdProducts = [];
  if (productCount === 0) {
    createdProducts = await Product.insertMany(SAMPLE_PRODUCTS);
  } else {
    createdProducts = await Product.find().limit(2);
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0 && createdProducts.length >= 2) {
    await Order.create({
      userId: customer._id,
      items: [
        {
          productId: createdProducts[0]._id,
          title: createdProducts[0].title,
          image: createdProducts[0].images[0],
          material: 'PETG',
          color: 'Ocean Blue',
          size: 'Medium',
          quantity: 1,
          unitPrice: 891,
        },
      ],
      totalAmount: 891,
      shippingAddress: {
        fullName: customer.name,
        phone: customer.phone,
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        pincode: customer.address.pincode,
      },
      orderStatus: 'Printing',
    });
  }

  return { admin, customer, productCount: await Product.countDocuments() };
}

module.exports = { seedIfEmpty, generateProductAssets };
