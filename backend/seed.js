import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from './src/config/env.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import { findUniquePhoto } from './src/services/imageService.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import User from './src/models/User.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@storedash.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2026!';

/**
 * Catalogue definition: [title, category, price, stockLevel, description, imageQuery].
 * `imageQuery` is the Pexels search phrase used to fetch that product's photograph.
 */
const CATALOGUE = [
  ['Aether 32" OLED Monitor', 'Premium Electronics', 1299, 8, '4K 240Hz OLED panel with 99% DCI-P3 coverage and hardware calibration for creators and competitive play.', 'oled computer monitor'],
  ['Vertex 4K Mirrorless Camera', 'Premium Electronics', 1899, 6, '45MP full-frame sensor, 8-stop in-body stabilisation, and uncropped 4K/60 video in a weather-sealed body.', 'mirrorless camera'],
  ['Halo Smart Projector', 'Premium Electronics', 649, 14, 'Native 1080p laser projector with auto-keystone, 2,400 lumens, and built-in streaming.', 'home projector'],
  ['Orbit 5G Flagship Phone', 'Premium Electronics', 999, 22, 'Titanium frame, 120Hz LTPO display, and a triple-lens camera system with 5x periscope zoom.', 'smartphone'],
  ['Lumen Pro 12.9" Tablet', 'Premium Electronics', 849, 17, 'Mini-LED display, desktop-class silicon, and pressure-sensitive stylus support.', 'tablet with stylus'],
  ['Prism 65" QLED Display', 'Premium Electronics', 1499, 5, 'Quantum-dot panel with 2,000-nit peak brightness and 144Hz variable refresh for next-gen consoles.', 'smart tv living room'],
  ['Nova 4K Pro Drone', 'Premium Electronics', 799, 9, 'Foldable 249g drone with obstacle avoidance, 46-minute flight time, and 1-inch sensor.', 'camera drone'],
  ['Echo Studio Soundbar', 'Premium Electronics', 449, 19, '5.1.2 Dolby Atmos soundbar with wireless subwoofer and adaptive room calibration.', 'soundbar'],
  ['Pulse 8K Action Camera', 'Premium Electronics', 429, 0, 'Waterproof to 20m with horizon-lock stabilisation and 8K/30 capture.', 'action camera'],
  ['Zenith E-Ink Reader', 'Premium Electronics', 249, 31, '7-inch glare-free display with warm backlight, weeks of battery, and waterproof construction.', 'e-reader'],

  ['Aurora ANC Headphones', 'Audio', 349, 25, 'Adaptive noise cancellation, 40mm beryllium drivers, and 38-hour battery life.', 'wireless over-ear headphones'],
  ['Sonic Buds Pro', 'Audio', 199, 48, 'True wireless earbuds with spatial audio, multipoint pairing, and IPX5 sweat resistance.', 'wireless earbuds'],
  ['Resonance Studio Monitors', 'Audio', 499, 7, 'Pair of 5-inch active nearfield monitors with flat response and balanced XLR inputs.', 'studio monitor speakers'],
  ['Cadence Sport Earbuds', 'Audio', 129, 36, 'Secure-fit open-ear design with bone-conduction tuning and 12-hour playtime.', 'sport earphones'],
  ['Vinyl Pro Turntable', 'Audio', 379, 4, 'Belt-drive turntable with carbon-fibre tonearm, Bluetooth output, and built-in phono preamp.', 'turntable record player'],
  ['Ember Portable Speaker', 'Audio', 159, 40, '360-degree sound, IP67 rating, and 24-hour battery in a rugged aluminium shell.', 'portable bluetooth speaker'],
  ['Mono Podcast Microphone', 'Audio', 189, 18, 'USB-C cardioid condenser microphone with tap-to-mute and zero-latency monitoring.', 'podcast microphone'],
  ['Tempo Gaming Headset', 'Audio', 149, 27, 'Lightweight wireless headset with 7.1 virtual surround and detachable boom microphone.', 'gaming headset'],
  ['Cloud Open-Back Headphones', 'Audio', 429, 11, 'Reference-grade open-back design with planar magnetic drivers and replaceable velour pads.', 'studio headphones'],

  ['Chrono Titanium Smartwatch', 'Wearables', 449, 13, 'Sapphire crystal, always-on AMOLED display, ECG, and 10-day battery life.', 'smartwatch'],
  ['Pulse Fitness Band', 'Wearables', 89, 60, 'Slim tracker with SpO2, sleep staging, and 14-day battery.', 'fitness tracker band'],
  ['Halcyon Smart Ring', 'Wearables', 299, 20, 'Titanium ring tracking readiness, temperature trends, and sleep with no subscription.', 'smart ring'],
  ['Meridian GPS Sports Watch', 'Wearables', 379, 3, 'Multi-band GPS, topographic maps, and training load analytics for endurance athletes.', 'gps sports watch'],
  ['Aero Sleep Tracker', 'Wearables', 129, 24, 'Contactless under-mattress sensor with heart-rate variability and snore detection.', 'sleep tracker'],
  ['Vista Smart Glasses', 'Wearables', 329, 10, 'Open-ear audio, voice assistant, and polarised lenses in a lightweight acetate frame.', 'smart glasses'],
  ['Sentinel Kids Tracker', 'Wearables', 79, 33, 'GPS and LTE child-safe watch with geofencing and parent-managed contacts.', 'kids smartwatch'],
  ['Tide Dive Computer', 'Wearables', 599, 2, 'Air and nitrox dive computer with 3D compass and rechargeable battery.', 'dive watch'],

  ['Forge 16" Creator Laptop', 'Computing', 2299, 7, '16-core CPU, discrete GPU, 32GB RAM, and a colour-accurate mini-LED display.', 'laptop video editing'],
  ['Slate 14" Ultrabook', 'Computing', 1399, 12, '980g magnesium chassis with 18-hour battery and a 3K OLED touchscreen.', 'ultrabook laptop'],
  ['Titan Mechanical Keyboard', 'Computing', 169, 28, 'Hot-swappable 75% board with gasket mount, PBT keycaps, and tri-mode connectivity.', 'mechanical keyboard'],
  ['Glide Precision Mouse', 'Computing', 99, 45, '8K polling sensor, 60g shell, and silent micro-switches for all-day comfort.', 'wireless computer mouse'],
  ['Atlas Thunderbolt Dock', 'Computing', 249, 16, '12-in-1 dock with dual 4K output, 96W charging, and 2.5GbE networking.', 'usb-c docking station'],
  ['Core NVMe SSD 2TB', 'Computing', 189, 38, 'PCIe 4.0 drive reaching 7,400MB/s reads with a low-profile heatsink.', 'nvme ssd'],
  ['Matrix Mini PC', 'Computing', 699, 9, 'Compact workstation with 8-core processor, 32GB RAM, and dual M.2 slots.', 'mini pc'],
  ['Vertex 4K Webcam', 'Computing', 149, 4, 'Sony STARVIS sensor, auto-framing, and dual noise-reducing microphones.', 'webcam'],
  ['Raven Wireless Trackpad', 'Computing', 129, 21, 'Multi-touch glass trackpad with haptic feedback and 3-device switching.', 'trackpad'],

  ['Meridian Leather Tote', 'Accessories', 189, 14, 'Full-grain vegetable-tanned leather with a padded 16-inch laptop compartment.', 'leather tote bag'],
  ['Strata Carbon Wallet', 'Accessories', 79, 52, 'RFID-blocking carbon-fibre cardholder with quick-access pull tab.', 'slim wallet'],
  ['Halo MagSafe Charger', 'Accessories', 59, 70, '15W magnetic wireless charger with a braided USB-C cable and aluminium stand.', 'wireless phone charger'],
  ['Vault Hard-Shell Case', 'Accessories', 49, 44, 'Military-grade drop protection with raised bezels and a soft microfibre lining.', 'phone case'],
  ['Solis Polarised Sunglasses', 'Accessories', 159, 15, 'Titanium-flex frame with scratch-resistant polarised lenses and UV400 protection.', 'polarized sunglasses'],
  ['Trail Commuter Backpack', 'Accessories', 129, 26, 'Weatherproof 24L pack with hidden pockets and a ventilated back panel.', 'commuter backpack'],
  ['Linen Laptop Sleeve', 'Accessories', 69, 39, 'Slim wool-felt sleeve with magnetic closure, available for 13 and 16-inch devices.', 'laptop sleeve'],
  ['Loom Cable Organiser', 'Accessories', 29, 80, 'Modular silicone organiser that keeps up to eight cables tidy on desks and in bags.', 'cable organizer'],
  ['Echo Leather Watch Strap', 'Accessories', 59, 35, 'Quick-release Italian leather strap with brushed stainless hardware.', 'leather watch strap'],
  ['Nomad Tech Pouch', 'Accessories', 49, 5, 'Structured travel pouch with elastic loops for chargers, drives, and adapters.', 'tech organizer pouch'],

  ['Volt 140W GaN Charger', 'Tech Gear', 89, 41, 'Three-port gallium-nitride charger that powers a laptop and two devices simultaneously.', 'usb-c charger'],
  ['Arc 25,000mAh Power Bank', 'Tech Gear', 79, 33, '140W two-way fast charging with a live wattage display and airline-safe capacity.', 'power bank'],
  ['Beacon Smart Home Hub', 'Tech Gear', 129, 19, 'Matter, Thread, and Zigbee controller with local automation and encrypted voice control.', 'smart home hub'],
  ['Lattice Wi-Fi 7 Mesh Router', 'Tech Gear', 349, 11, 'Tri-band mesh system covering 5,000 sq ft with multi-gig wired backhaul.', 'wifi router'],
  ['Stream 4K Capture Card', 'Tech Gear', 179, 8, 'Low-latency HDMI 2.1 capture with 4K/60 passthrough for streaming and recording.', 'streaming setup'],
  ['Pixel Smart LED Strip', 'Tech Gear', 59, 58, 'Addressable RGBIC lighting with music sync and app-free local control.', 'led strip lights'],
  ['Anchor Aluminium Laptop Stand', 'Tech Gear', 89, 29, 'Height-adjustable CNC stand with passive cooling and a fold-flat travel profile.', 'laptop stand'],
  ['Signal 8-in-1 USB-C Hub', 'Tech Gear', 79, 47, '4K HDMI, SD and microSD readers, 100W passthrough, and gigabit Ethernet.', 'usb-c hub'],
  ['Lens Pro Ring Light', 'Tech Gear', 99, 23, 'Dimmable 12-inch bi-colour light with tripod and phone mount for video calls and product shots.', 'ring light'],
  ['Torque Precision Toolkit', 'Tech Gear', 69, 2, '112-piece driver set with magnetic bits, spudgers, and a compact aluminium case.', 'precision screwdriver set'],
];

/**
 * Expands catalogue tuples into Product documents, fetching one distinct Pexels
 * photograph per product. A failed lookup never aborts seeding: the product is
 * stored without an image and the storefront renders a category tile for it.
 * @returns {Promise<Array<object>>}
 */
async function buildProducts() {
  const claimedIds = new Set();
  const hasKey = Boolean(env.pexelsApiKey);
  if (!hasKey) console.warn('PEXELS_API_KEY is not set; products will be seeded without images.');

  const products = [];
  for (const [title, category, price, stockLevel, description, imageQuery] of CATALOGUE) {
    let imageUrl = '';
    if (hasKey) {
      try {
        const photo = await findUniquePhoto(imageQuery, claimedIds);
        if (photo) {
          imageUrl = photo.url;
          console.log(`  ${title} <- "${photo.alt}" [pexels:${photo.id}]`);
        } else {
          console.warn(`  ${title}: no unused photo found for "${imageQuery}"`);
        }
      } catch (error) {
        console.warn(`  ${title}: image lookup failed (${error.message})`);
        if (/rejected the API key/.test(error.message)) break;
      }
    }
    products.push({ title, category, price, stockLevel, description, imageUrl });
  }

  const missing = CATALOGUE.length - products.length;
  if (missing > 0) {
    for (const [title, category, price, stockLevel, description] of CATALOGUE.slice(products.length)) {
      products.push({ title, category, price, stockLevel, description, imageUrl: '' });
    }
  }
  return products;
}

const CUSTOMER_NAMES = [
  'Ali Raza', 'Ayesha Khan', 'Bilal Ahmed', 'Fatima Noor', 'Hamza Sheikh', 'Zainab Malik', 'Usman Tariq', 'Maryam Iqbal',
  'Hassan Javed', 'Sana Yousaf', 'Omar Farooq', 'Hira Aslam', 'Daniyal Butt', 'Noor Fatima', 'Saad Mehmood', 'Laiba Siddiqui',
  'Talha Rehman', 'Iqra Shahid', 'Faisal Qureshi', 'Mahnoor Ali', 'Ahmed Hussain', 'Rabia Anwar', 'Kamran Akbar', 'Sidra Nawaz',
  'Rizwan Ullah', 'Amna Rauf', 'Junaid Haider', 'Komal Zafar', 'Imran Saleem', 'Zara Bashir', 'Waleed Khalid', 'Eman Tahir',
];

const HISTORY_DAYS = 120;
const ORDER_COUNT = 300;
const DAY_MS = 86_400_000;

/**
 * Deterministic PRNG (mulberry32) so repeated seeds produce identical datasets.
 * @param {number} seed
 * @returns {() => number} Generator yielding floats in [0, 1).
 */
function createRandom(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chooses an order status appropriate to the order's age: fresh orders are
 * still moving through fulfilment, older ones are overwhelmingly delivered.
 * @param {number} ageDays
 * @param {() => number} random
 * @returns {string}
 */
function statusForAge(ageDays, random) {
  const roll = random();
  if (ageDays < 2) return roll < 0.4 ? 'pending' : 'paid';
  if (ageDays < 7) return roll < 0.1 ? 'cancelled' : roll < 0.4 ? 'paid' : 'shipped';
  return roll < 0.09 ? 'cancelled' : roll < 0.14 ? 'shipped' : 'delivered';
}

/**
 * Replaces customer accounts with demo customers. A single pre-computed hash is
 * shared across them (bypassing per-document hashing) because these accounts
 * exist for analytics data and are not meant to be signed into.
 * @param {() => number} random
 * @returns {Promise<Array<{name: string, email: string, createdAt: Date}>>}
 */
async function seedCustomers(random) {
  await User.deleteMany({ role: 'customer' });
  const password = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
  const now = Date.now();

  const customers = CUSTOMER_NAMES.map((name) => {
    const createdAt = new Date(now - Math.floor(random() * HISTORY_DAYS) * DAY_MS);
    return { name, email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`, password, role: 'customer', createdAt, updatedAt: createdAt };
  });
  await User.collection.insertMany(customers);
  return customers;
}

/**
 * Generates historical orders weighted toward recent days to simulate growth.
 * Documents are written through the raw collection so backdated timestamps are preserved.
 * @param {Array<object>} products Persisted product documents.
 * @param {Array<{name: string, email: string}>} customers
 * @param {() => number} random
 * @returns {Promise<number>} Number of orders created.
 */
async function seedOrders(products, customers, random) {
  const now = Date.now();

  const orders = Array.from({ length: ORDER_COUNT }, () => {
    const ageDays = Math.floor(Math.pow(random(), 1.5) * HISTORY_DAYS);
    const createdAt = new Date(now - ageDays * DAY_MS - Math.floor(random() * DAY_MS));
    const customer = customers[Math.floor(random() * customers.length)];
    const lineCount = 1 + Math.floor(random() * random() * 4);

    const chosen = new Set();
    while (chosen.size < lineCount) chosen.add(products[Math.floor(random() * products.length)]);

    const items = [...chosen].map((product) => ({
      product: product._id,
      title: product.title,
      category: product.category,
      price: product.price,
      quantity: product.price > 500 ? 1 : 1 + Math.floor(random() * 3),
    }));
    const totalAmount = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

    return {
      customerName: customer.name,
      customerEmail: customer.email,
      shippingAddress: 'On file',
      items,
      totalAmount,
      status: statusForAge(ageDays, random),
      createdAt,
      updatedAt: createdAt,
    };
  });

  await Order.collection.insertMany(orders);
  return orders.length;
}

/**
 * Guarantees exactly one administrator: any other admin accounts are removed
 * before the configured account is created or has its credentials reset.
 */
async function provisionAdmin() {
  await User.deleteMany({ role: 'admin', email: { $ne: ADMIN_EMAIL } });

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.password = ADMIN_PASSWORD;
    existing.role = 'admin';
    await existing.save();
    return;
  }
  await User.create({ name: 'Store Administrator', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
}

async function run() {
  try {
    await connectDB();
    const random = createRandom(2026);

    await Promise.all([Product.deleteMany({}), Order.deleteMany({})]);
    const products = await Product.insertMany(await buildProducts());
    const customers = await seedCustomers(random);
    const orderCount = await seedOrders(products, customers, random);
    await provisionAdmin();

    console.log(`Seeded ${products.length} products, ${customers.length} customers and ${orderCount} orders (${env.nodeEnv}).`);
    console.log(`Administrator account ready: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
