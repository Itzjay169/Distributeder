import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data in reverse order of dependencies
  await prisma.platformSetting.deleteMany();
  await prisma.disputeReport.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderTimelineEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned old records.");

  // Non-breached, strong unique passwords
  const adminPassword = await bcrypt.hash("Distributeder#Admin2026!", 10);
  const sellerPassword = await bcrypt.hash("Distributeder#Seller2026!", 10);
  const buyerPassword = await bcrypt.hash("Distributeder#Buyer2026!", 10);

  // 1. Create Users
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Distributeder Admin",
      email: "admin@distributeder.com",
      password: adminPassword,
      role: "ADMIN",
      isSeller: false,
      activeMode: "BUYER",
      phone: "+91 98100 55010",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  });

  // Sellers
  const sellerUser1 = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "seller1@apexhardware.com",
      password: sellerPassword,
      role: "USER",
      isSeller: true,
      activeMode: "SELLER",
      phone: "+91 98765 43210",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      sellerProfile: {
        create: {
          storeName: "Apex Industrial & Hardware",
          storeSlug: "apex-industrial-hardware",
          storeDescription: "Premier ISO-certified distributor of industrial machinery, precision tools, fasteners, and heavy hardware supplies.",
          companyType: "Distributor",
          businessAddress: "450 Industrial Area, Phase II, Peenya, Bengaluru 560058",
          taxId: "29AABCU9603R1ZM",
          isApproved: true,
          isVerified: true,
          rating: 4.95,
          totalSales: 1840,
          balance: 2045000.0,
          logo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80",
          banner: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
        },
      },
    },
    include: { sellerProfile: true },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      email: "seller2@novatech.com",
      password: sellerPassword,
      role: "USER",
      isSeller: true,
      activeMode: "SELLER",
      phone: "+91 99876 54321",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      sellerProfile: {
        create: {
          storeName: "NovaTech Direct",
          storeSlug: "novatech-direct",
          storeDescription: "Authorized direct distributor for next-gen consumer electronics, enterprise server hardware, and audio equipment.",
          companyType: "Manufacturer",
          businessAddress: "102 Electronics City, Hosur Road, Bengaluru 560100",
          taxId: "29AADCN1234H1ZQ",
          isApproved: true,
          isVerified: true,
          rating: 4.88,
          totalSales: 3120,
          balance: 4083000.0,
          logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80",
          banner: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        },
      },
    },
    include: { sellerProfile: true },
  });

  const sellerUser3 = await prisma.user.create({
    data: {
      name: "David Morales",
      email: "seller3@greenearth.com",
      password: sellerPassword,
      role: "USER",
      isSeller: true,
      activeMode: "SELLER",
      phone: "+91 98234 56789",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      sellerProfile: {
        create: {
          storeName: "GreenEarth Organics & Agro",
          storeSlug: "greenearth-organics-agro",
          storeDescription: "Farm-to-market distributor supplying bulk organic produce, certified bio-fertilizers, seeds, and commercial kitchen staples.",
          companyType: "Supplier",
          businessAddress: "77 Agri Market Yard, APMC, Nashik, Maharashtra 422001",
          taxId: "27AAPFG7890K1ZL",
          isApproved: true,
          isVerified: true,
          rating: 4.92,
          totalSales: 940,
          balance: 1185700.0,
          logo: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=200&q=80",
          banner: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
        },
      },
    },
    include: { sellerProfile: true },
  });

  // Dedicated Seller 4: Alex Rivera (Hybrid Global Trade)
  const sellerUser4 = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "seller4@hybridtrade.com",
      password: sellerPassword,
      role: "USER",
      isSeller: true,
      activeMode: "SELLER",
      phone: "+91 95553 11222",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      sellerProfile: {
        create: {
          storeName: "Hybrid Global Trade",
          storeSlug: "hybrid-global-trade",
          storeDescription: "Multi-category importer & exporter supplying lifestyle goods, kitchenware, and specialty home commodities.",
          companyType: "Wholesaler",
          businessAddress: "88 Nehru Place, New Delhi 110019",
          taxId: "07AAFCH6612M1ZP",
          isApproved: true,
          isVerified: true,
          rating: 4.85,
          totalSales: 410,
          balance: 517700.0,
          logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80",
          banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        },
      },
    },
    include: { sellerProfile: true },
  });

  // Buyers
  const buyerUser1 = await prisma.user.create({
    data: {
      name: "Sophia Chen (ProcureHub)",
      email: "buyer1@procurehub.com",
      password: buyerPassword,
      role: "USER",
      isSeller: false,
      activeMode: "BUYER",
      phone: "+91 98456 78901",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
  });

  const buyerUser2 = await prisma.user.create({
    data: {
      name: "Liam O'Connor (RetailMesh)",
      email: "buyer2@retailmesh.com",
      password: buyerPassword,
      role: "USER",
      isSeller: false,
      activeMode: "BUYER",
      phone: "+91 97890 01234",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
  });

  const buyerUser3 = await prisma.user.create({
    data: {
      name: "Maya Patel (BuildersCo)",
      email: "buyer3@buildersco.com",
      password: buyerPassword,
      role: "USER",
      isSeller: false,
      activeMode: "BUYER",
      phone: "+91 98901 23456",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  });

  console.log("👥 Users and Seller Profiles created.");

  // Buyer Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: buyerUser1.id,
        fullName: "Sophia Chen",
        phone: "+91 98456 78901",
        street: "1250 Logistic Park, Bhiwandi, Dock 4",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "421302",
        country: "India",
        isDefault: true,
      },
      {
        userId: buyerUser2.id,
        fullName: "Liam O'Connor",
        phone: "+91 97890 01234",
        street: "840 Whitefield Industrial Area, Bay 12",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560066",
        country: "India",
        isDefault: true,
      },
      {
        userId: buyerUser3.id,
        fullName: "Maya Patel",
        phone: "+91 98901 23456",
        street: "742 Connaught Place, Block A",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110001",
        country: "India",
        isDefault: true,
      },
    ],
  });

  // 2. Categories
  const categoriesData = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Smartphones, laptops, semiconductors, network gear, and audio solutions.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
      icon: "Cpu",
    },
    {
      name: "Industrial Supplies",
      slug: "industrial-supplies",
      description: "Valves, heavy machinery, safety gear, fasteners, pumps, and pneumatic equipment.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      icon: "Wrench",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Commercial cookware, dinnerware sets, storage, small appliances, and linens.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
      icon: "Home",
    },
    {
      name: "Groceries",
      slug: "groceries",
      description: "Bulk grains, organic pulses, coffees, cold-pressed oils, and spices.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      icon: "ShoppingBag",
    },
    {
      name: "Agriculture",
      slug: "agriculture",
      description: "Bio-fertilizers, hybrid seeds, irrigation pipes, greenhouses, and pest control.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
      icon: "Sprout",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Uniforms, bulk textiles, apparel blanks, protective workwear, and footwear.",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
      icon: "Shirt",
    },
    {
      name: "Beauty",
      slug: "beauty",
      description: "Cosmetics ingredients, salon bulk supplies, skincare batches, and packaging.",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
      icon: "Sparkles",
    },
    {
      name: "Books",
      slug: "books",
      description: "Educational manuals, technical engineering guides, notebooks, and print stocks.",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      icon: "BookOpen",
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: cat,
    });
  }

  console.log("📂 Categories created.");

  const pApex = sellerUser1.sellerProfile!.id;
  const pNova = sellerUser2.sellerProfile!.id;
  const pGreen = sellerUser3.sellerProfile!.id;
  const pHybrid = sellerUser4.sellerProfile!.id;

  // 3. 40+ Products
  const productsRaw = [
    // --- ELECTRONICS (NovaTech & Hybrid) ---
    {
      sellerId: pNova,
      categoryId: categories["electronics"].id,
      title: "NovaSound Pro Enterprise Wireless Noise-Cancelling Headphones",
      slug: "novasound-pro-headphones",
      description: "High-fidelity 45mm neodymium drivers with active hybrid noise cancellation. Designed for call centers, executives, and audio professionals. Includes 40-hour battery life and multi-point Bluetooth 5.3 pairing.",
      price: 15799,
      compareAtPrice: 20799,
      sku: "NV-AUD-001",
      stock: 450,
      moq: 5,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 12 },
        { minQty: 50, discountPercent: 22 },
        { minQty: 100, discountPercent: 30 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Color", options: ["Matte Black", "Space Gray", "Silver Pearl"] },
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 38,
    },
    {
      sellerId: pNova,
      categoryId: categories["electronics"].id,
      title: "UltraSync 4K 144Hz 27-inch IPS Professional Monitor",
      slug: "ultrasync-4k-27-inch-monitor",
      description: "Color-calibrated Delta E < 1 display with 99% DCI-P3 gamut. 65W USB-C power delivery, HDMI 2.1, DisplayPort 1.4. Ideal for CAD designers, video editors, and trading desks.",
      price: 33099,
      compareAtPrice: 41399,
      sku: "NV-DIS-027",
      stock: 180,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 8 },
        { minQty: 20, discountPercent: 16 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 4.8,
      reviewCount: 22,
    },
    {
      sellerId: pNova,
      categoryId: categories["electronics"].id,
      title: "Rackmount 24-Port Managed Gigabit PoE+ Switch",
      slug: "rackmount-24-port-poe-switch",
      description: "Layer 2+ smart managed switch with 370W total PoE budget, 4 SFP uplink ports, VLAN tagging, QoS priority queuing, and web-based enterprise management.",
      price: 23999,
      compareAtPrice: 28999,
      sku: "NV-NET-024",
      stock: 95,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 15, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.7,
      reviewCount: 15,
    },
    {
      sellerId: pNova,
      categoryId: categories["electronics"].id,
      title: "Enterprise 100W GaN Fast Charger Multi-Port Dock (5-Pack)",
      slug: "gan-fast-charger-100w-dock-pack",
      description: "Ultra-compact Gallium Nitride wall charging brick with 3 USB-C PD 3.0 ports and 1 USB-A port. Certified for modern laptops, tablets, and smartphones.",
      price: 16199,
      compareAtPrice: 19899,
      sku: "NV-PWR-100P",
      stock: 320,
      moq: 5,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 15 },
        { minQty: 50, discountPercent: 25 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.9,
      reviewCount: 29,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["electronics"].id,
      title: "Ergonomic Mechanical Keyboard with Hot-Swappable Switches",
      slug: "ergonomic-mechanical-keyboard",
      description: "Custom Gateron brown tactile switches, sound-dampening silicone gasket mount, south-facing RGB, and aluminum frame. Detachable braided USB-C cable.",
      price: 7429,
      compareAtPrice: 9899,
      sku: "HY-KEY-087",
      stock: 210,
      moq: 10,
      wholesaleTiers: JSON.stringify([
        { minQty: 20, discountPercent: 10 },
        { minQty: 100, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Switch Type", options: ["Brown Tactile", "Red Linear", "Blue Clicky"] },
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 44,
    },
    {
      sellerId: pNova,
      categoryId: categories["electronics"].id,
      title: "Industrial Barcode & QR Code Scanner with Bluetooth Base",
      slug: "industrial-barcode-qr-scanner",
      description: "Drop-resistant to 2 meters. Scans high-density 1D and 2D barcodes from mobile screens or damaged shipping labels. Range up to 100 meters.",
      price: 10699,
      compareAtPrice: 13699,
      sku: "NV-SCN-002",
      stock: 140,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 12 },
        { minQty: 30, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 5.0,
      reviewCount: 19,
    },

    // --- INDUSTRIAL SUPPLIES (Apex Hardware) ---
    {
      sellerId: pApex,
      categoryId: categories["industrial-supplies"].id,
      title: "Stainless Steel 316 High-Pressure Ball Valve (2-inch)",
      slug: "stainless-steel-316-high-pressure-ball-valve-2inch",
      description: "Full port, 1000 WOG rating ball valve forged with chemical-resistant SUS316 stainless steel. PTFE seals, blowout-proof stem, locking handle mechanism.",
      price: 5349,
      compareAtPrice: 7049,
      sku: "APX-VLV-200",
      stock: 600,
      moq: 10,
      wholesaleTiers: JSON.stringify([
        { minQty: 25, discountPercent: 12 },
        { minQty: 100, discountPercent: 24 },
        { minQty: 500, discountPercent: 35 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.95,
      reviewCount: 52,
    },
    {
      sellerId: pApex,
      categoryId: categories["industrial-supplies"].id,
      title: "Brushless 20V Cordless Impact Driver Kit with 2x 4.0Ah Batteries",
      slug: "brushless-cordless-impact-driver-kit",
      description: "Delivers 2,200 in-lbs of breakaway torque. Variable 3-speed selector with LED ring lighting. Comes with hard-shell storage case, rapid charger, and 2 batteries.",
      price: 13199,
      compareAtPrice: 16499,
      sku: "APX-TL-20V",
      stock: 240,
      moq: 4,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 10 },
        { minQty: 40, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 4.85,
      reviewCount: 31,
    },
    {
      sellerId: pApex,
      categoryId: categories["industrial-supplies"].id,
      title: "ANSI Cut-Level A4 Nitrile Palm Coated Work Gloves (Pack of 120)",
      slug: "cut-level-a4-nitrile-work-gloves-120pack",
      description: "13-gauge HPPE seamless knit liner with microporous sandy nitrile coating. Superb wet and oily grip for construction, metal fabrication, and logistics.",
      price: 14899,
      compareAtPrice: 19899,
      sku: "APX-PPE-GLV",
      stock: 400,
      moq: 5,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 15 },
        { minQty: 50, discountPercent: 25 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Size", options: ["Medium (8)", "Large (9)", "X-Large (10)"] },
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 40,
    },
    {
      sellerId: pApex,
      categoryId: categories["industrial-supplies"].id,
      title: "Heavy-Duty Hydraulic Floor Jack 3.5 Ton Quick Pump",
      slug: "heavy-duty-hydraulic-floor-jack-3-5-ton",
      description: "Dual piston rapid pump lifts vehicles in 3.5 pumps. Heavy-gauge welded steel chassis with bypass valve preventing overloading.",
      price: 17799,
      compareAtPrice: 23199,
      sku: "APX-HYD-035",
      stock: 80,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 12 },
        { minQty: 20, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.7,
      reviewCount: 14,
    },
    {
      sellerId: pApex,
      categoryId: categories["industrial-supplies"].id,
      title: "Industrial Grade Zinc Plated Hex Head Bolt Assortment (2,400 pcs)",
      slug: "industrial-zinc-hex-bolt-assortment",
      description: "Grade 8 high tensile strength steel bolts, washers, and nuts organized in heavy steel compartment storage bins. Diameters from 1/4\" to 1/2\".",
      price: 23999,
      compareAtPrice: 31499,
      sku: "APX-FST-240",
      stock: 120,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 6, discountPercent: 14 },
        { minQty: 25, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 4.9,
      reviewCount: 26,
    },
    {
      sellerId: pApex,
      categoryId: categories["industrial-supplies"].id,
      title: "Submersible Stainless Steel Sump & Sewage Pump 1.5HP",
      slug: "submersible-stainless-sewage-pump-1-5hp",
      description: "Cast iron vortex impeller capable of passing 2-inch solids. Thermal overload protection with 30ft water-resistant power cord.",
      price: 28599,
      compareAtPrice: 34799,
      sku: "APX-PMP-150",
      stock: 65,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 4, discountPercent: 10 },
        { minQty: 10, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.8,
      reviewCount: 11,
    },

    // --- HOME & KITCHEN (Hybrid & NovaTech) ---
    {
      sellerId: pHybrid,
      categoryId: categories["home-kitchen"].id,
      title: "Commercial Grade 18/10 Tri-Ply Stainless Steel Cookware Set (12-Piece)",
      slug: "commercial-tri-ply-stainless-cookware-12pc",
      description: "Full aluminum core encapsulated between layers of food-grade 304 and magnetic 430 stainless steel. Compatible with induction, gas, and oven up to 500°F.",
      price: 20649,
      compareAtPrice: 26499,
      sku: "HY-KIT-012",
      stock: 130,
      moq: 3,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 12 },
        { minQty: 30, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584990347449-3990e7939a73?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 35,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["home-kitchen"].id,
      title: "Handcrafted Ceramic Dinnerware Collection - 48 Piece Restaurant Set",
      slug: "handcrafted-ceramic-dinnerware-48pc",
      description: "Scratch-resistant semi-matte glaze finish, chip-resistant rim, microwave and dishwasher safe. Service for 12 covers including dinner plates, bowls, and salad plates.",
      price: 25699,
      compareAtPrice: 34799,
      sku: "HY-CRM-048",
      stock: 90,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 20, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Glaze Color", options: ["Oatmeal Matte", "Midnight Slate", "Terracotta Clay"] },
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.85,
      reviewCount: 18,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["home-kitchen"].id,
      title: "Commercial High-Velocity Barista Espresso Grinder",
      slug: "commercial-barista-espresso-grinder",
      description: "64mm flat titanium burrs with stepless micro-metric grind adjustment. Low retention chamber (<0.1g) with automated timed dosing display.",
      price: 37299,
      compareAtPrice: 47999,
      sku: "HY-ESP-064",
      stock: 45,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 8 },
        { minQty: 10, discountPercent: 16 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 4.95,
      reviewCount: 16,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["home-kitchen"].id,
      title: "Airtight Borosilicate Glass Food Storage Containers with Bamboo Lids (Pack of 24)",
      slug: "borosilicate-glass-containers-bamboo-24pack",
      description: "Thermal shock resistant up to 400°C. Eco-friendly natural bamboo lids with food-safe silicone gasket seal for pantry organization.",
      price: 8129,
      compareAtPrice: 11199,
      sku: "HY-GLS-024",
      stock: 280,
      moq: 5,
      wholesaleTiers: JSON.stringify([
        { minQty: 15, discountPercent: 14 },
        { minQty: 50, discountPercent: 25 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 27,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["home-kitchen"].id,
      title: "Egyptian Long-Staple Cotton Luxury Bath Towels Bulk Bundle (Pack of 20)",
      slug: "egyptian-cotton-bath-towels-bulk-20pack",
      description: "700 GSM plush ring-spun Egyptian combed cotton. High absorbency, double-stitched hems designed for premium hotel and boutique hospitality use.",
      price: 15749,
      compareAtPrice: 21549,
      sku: "HY-TWL-020",
      stock: 160,
      moq: 4,
      wholesaleTiers: JSON.stringify([
        { minQty: 8, discountPercent: 12 },
        { minQty: 25, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Color", options: ["Pure White", "Charcoal Gray", "Linen Sand"] },
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.75,
      reviewCount: 19,
    },

    // --- GROCERIES (GreenEarth) ---
    {
      sellerId: pGreen,
      categoryId: categories["groceries"].id,
      title: "Bulk Single-Origin Ethiopian Yirgacheffe Green Coffee Beans (60 kg Burlap Bag)",
      slug: "ethiopian-yirgacheffe-green-coffee-60kg",
      description: "Grade 1 Specialty Arabica raw beans. Bright bergamot citrus notes, jasmine aroma, and honey finish. Fresh harvest direct from cooperative washing stations.",
      price: 40999,
      compareAtPrice: 51399,
      sku: "GE-COF-060",
      stock: 85,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 8 },
        { minQty: 10, discountPercent: 15 },
        { minQty: 25, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.95,
      reviewCount: 33,
    },
    {
      sellerId: pGreen,
      categoryId: categories["groceries"].id,
      title: "Cold-Pressed Extra Virgin Olive Oil Drum (200 Liters / 53 Gallon)",
      slug: "cold-pressed-evoo-drum-200l",
      description: "First cold press unfiltered Koroneiki olives. Acidity < 0.28%. Rich in polyphenols and monounsaturated healthy fats. Nitrogen-flushed steel drum for restaurants & packers.",
      price: 111999,
      compareAtPrice: 136899,
      sku: "GE-OIL-200",
      stock: 35,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 2, discountPercent: 6 },
        { minQty: 5, discountPercent: 12 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 4.9,
      reviewCount: 14,
    },
    {
      sellerId: pGreen,
      categoryId: categories["groceries"].id,
      title: "Organic White Royal Quinoa Bulk Sack (25 kg / 55 lbs)",
      slug: "organic-white-royal-quinoa-sack-25kg",
      description: "Pre-washed and saponin-free ancient grain sourced from the Bolivian Altiplano. High protein complete amino acid profile, USDA Organic & Non-GMO verified.",
      price: 7299,
      compareAtPrice: 9099,
      sku: "GE-GRN-025",
      stock: 220,
      moq: 5,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 10 },
        { minQty: 30, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 28,
    },
    {
      sellerId: pGreen,
      categoryId: categories["groceries"].id,
      title: "Raw Unpasteurized Wildflower Mountain Honey (Bulk 25 kg Pail)",
      slug: "raw-wildflower-mountain-honey-25kg",
      description: "Pure unprocessed mountain apiary honey with natural pollens and enzymes intact. Tested zero antibiotics and pesticide-free.",
      price: 16149,
      compareAtPrice: 19899,
      sku: "GE-HNY-025",
      stock: 140,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 15, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.9,
      reviewCount: 21,
    },
    {
      sellerId: pGreen,
      categoryId: categories["groceries"].id,
      title: "Tellicherry Special Extra Bold (TSEB) Black Peppercorns (10 kg Box)",
      slug: "tellicherry-tseb-black-peppercorn-10kg",
      description: "Sun-dried whole black peppercorns from Malabar coast, India. Sized > 4.75mm with intense piperine aroma and rich fruity bite.",
      price: 10349,
      compareAtPrice: 13249,
      sku: "GE-SPC-010",
      stock: 180,
      moq: 3,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 12 },
        { minQty: 25, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.88,
      reviewCount: 16,
    },

    // --- AGRICULTURE (GreenEarth) ---
    {
      sellerId: pGreen,
      categoryId: categories["agriculture"].id,
      title: "OMRI Listed Organic Vermicompost Bio-Fertilizer (Bulk 1-Ton Pallet / 40 Bags)",
      slug: "omri-organic-vermicompost-bio-fertilizer-pallet",
      description: "Earthworm cast enriched biological humus teeming with mycorrhizae and beneficial soil microbes. Restores degraded soil and enhances moisture retention.",
      price: 56399,
      compareAtPrice: 70449,
      sku: "GE-AGR-001",
      stock: 45,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 10 },
        { minQty: 10, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.95,
      reviewCount: 26,
    },
    {
      sellerId: pGreen,
      categoryId: categories["agriculture"].id,
      title: "Pressure-Compensating Drip Irrigation Tubing Reel (1,000 Meters / 3,280 ft)",
      slug: "pressure-compensating-drip-tubing-1000m",
      description: "16mm UV-resistant polyethylene tubing with integrated turbulent flow emitters spaced at 30cm. Flow rate 2.0 L/hr even on undulating terrain.",
      price: 19899,
      compareAtPrice: 25699,
      sku: "GE-IRR-100",
      stock: 110,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 6, discountPercent: 12 },
        { minQty: 20, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 4.8,
      reviewCount: 19,
    },
    {
      sellerId: pGreen,
      categoryId: categories["agriculture"].id,
      title: "Non-GMO Hybrid Sweet Corn F1 Seeds (100,000 Seed Commercial Pack)",
      slug: "hybrid-sweet-corn-f1-commercial-seeds",
      description: "Triple-sweet sh2 gene hybrid offering 82 days to harvest, exceptional seedling vigor, tight husk tip cover, and high disease tolerance against Stewart's wilt.",
      price: 26499,
      compareAtPrice: 33999,
      sku: "GE-SED-100K",
      stock: 75,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 15, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 15,
    },
    {
      sellerId: pGreen,
      categoryId: categories["agriculture"].id,
      title: "Commercial UV-Stabilized Greenhouse Polyethylene Film (40ft x 100ft, 6-Mil)",
      slug: "greenhouse-uv-polyethylene-film-40x100",
      description: "4-year anti-condensate, thermal heat retention greenhouse cover. Transmits 90% PAR light with 55% diffusion to eliminate hotspot leaf scorching.",
      price: 40599,
      compareAtPrice: 51399,
      sku: "GE-GRN-401",
      stock: 40,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 8 },
        { minQty: 8, discountPercent: 16 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.75,
      reviewCount: 9,
    },
    {
      sellerId: pGreen,
      categoryId: categories["agriculture"].id,
      title: "Organic Cold-Pressed Neem Oil Concentrate 100% Pure (Bulk 20 Liters)",
      slug: "pure-neem-oil-concentrate-20l",
      description: "High Azadirachtin (min 3000 ppm) natural insect growth regulator and fungicide. Water-soluble formulation for biological crop stewardship.",
      price: 14499,
      compareAtPrice: 18199,
      sku: "GE-BIO-020",
      stock: 130,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 20, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.85,
      reviewCount: 12,
    },

    // --- FASHION (Hybrid Global Trade) ---
    {
      sellerId: pHybrid,
      categoryId: categories["fashion"].id,
      title: "Heavyweight 280 GSM Organic Cotton Blank T-Shirts (Box of 100)",
      slug: "heavyweight-280gsm-blank-tshirts-100box",
      description: "Pre-shrunk ring-spun carded combed cotton. Tearaway neck labels, drop shoulder modern oversized cut ideal for screen printing and embroidery lines.",
      price: 450.0,
      compareAtPrice: 600.0,
      sku: "HY-APP-100",
      stock: 350,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 12 },
        { minQty: 20, discountPercent: 25 },
        { minQty: 50, discountPercent: 35 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Color", options: ["Washed Vintage Black", "Raw Chalk White", "Military Sage"] },
        { name: "Size Mix", options: ["Assorted (S-XL)", "All Large", "All Medium"] },
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.88,
      reviewCount: 42,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["fashion"].id,
      title: "Hi-Vis Class 3 Reflective Waterproof Safety Bomber Jacket (Lot of 25)",
      slug: "hi-vis-class-3-safety-bomber-jacket-25lot",
      description: "Fluorescent 300D Oxford polyurethane shell with taped waterproof seams. 2-inch silver reflective tape strips. Detachable fleece thermal lining.",
      price: 590.0,
      compareAtPrice: 780.0,
      sku: "HY-SAF-025",
      stock: 120,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 4, discountPercent: 10 },
        { minQty: 10, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Color", options: ["Safety Lime Yellow", "Safety High-Risk Orange"] },
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.8,
      reviewCount: 16,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["fashion"].id,
      title: "Steel Toe Electrical Hazard Slip-On Work Boots (Wholesale Carton 12 Pairs)",
      slug: "steel-toe-slipon-work-boots-12carton",
      description: "Full-grain crazy horse leather with Goodyear welt construction. ASTM F2413 approved steel toe cap and puncture-resistant Kevlar midsole.",
      price: 720.0,
      compareAtPrice: 960.0,
      sku: "HY-FTW-012",
      stock: 90,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 8 },
        { minQty: 10, discountPercent: 18 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Shoe Size Assortment", options: ["US 8-11 Balanced", "US 9-13 Heavy"] },
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 23,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["fashion"].id,
      title: "Commercial Canvas Apron with Reinforced Brass Rivets (Pack of 50)",
      slug: "canvas-apron-brass-rivets-50pack",
      description: "16 oz water-repellent duck canvas with adjustable criss-cross back straps to prevent neck strain. Designed for baristas, chefs, and salon stylists.",
      price: 320.0,
      compareAtPrice: 440.0,
      sku: "HY-APR-050",
      stock: 140,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 12 },
        { minQty: 15, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.85,
      reviewCount: 17,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["fashion"].id,
      title: "Recycled Thermal Fleece Pullover Sweatshirts (Lot of 60)",
      slug: "recycled-thermal-fleece-pullover-60lot",
      description: "Crafted from 100% post-consumer recycled PET bottles. Anti-pilling micro-fleece interior with zip collar and kangaroo warming pocket.",
      price: 540.0,
      compareAtPrice: 720.0,
      sku: "HY-FLC-060",
      stock: 110,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 15, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.75,
      reviewCount: 11,
    },

    // --- BEAUTY (Hybrid & GreenEarth) ---
    {
      sellerId: pGreen,
      categoryId: categories["beauty"].id,
      title: "Pure Moroccan Argan Oil Cold Pressed Bulk Drum (25 Liters / 6.6 Gal)",
      slug: "pure-moroccan-argan-oil-drum-25l",
      description: "Ecocert certified 100% pure organic virgin Argania Spinosa kernel oil. Raw cosmetic base for high-end luxury hair serums and anti-aging skincare formulations.",
      price: 650.0,
      compareAtPrice: 850.0,
      sku: "GE-BTY-025",
      stock: 45,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 2, discountPercent: 8 },
        { minQty: 5, discountPercent: 15 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1608248597359-0097651a2d59?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: true,
      rating: 4.95,
      reviewCount: 20,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["beauty"].id,
      title: "Amber Glass Dropper Bottles 30ml / 1oz with Pipette (Case of 240)",
      slug: "amber-glass-dropper-bottles-30ml-240case",
      description: "Pharmaceutical grade UV-filtering amber glass with leakproof rubber bulb pipettes. Essential packaging for essential oils, serums, and tinctures.",
      price: 135.0,
      compareAtPrice: 180.0,
      sku: "HY-PKG-240",
      stock: 310,
      moq: 3,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 14 },
        { minQty: 40, discountPercent: 26 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.8,
      reviewCount: 31,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["beauty"].id,
      title: "Professional Salon Ceramic Tourmaline Ionic Hair Dryers (Pack of 12)",
      slug: "professional-salon-ionic-hair-dryers-12pack",
      description: "2200W AC brushless motor engineered for 5,000 continuous hours. Emits negative ions reducing frizz while cutting drying time in half.",
      price: 420.0,
      compareAtPrice: 560.0,
      sku: "HY-SLN-012",
      stock: 80,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 10 },
        { minQty: 10, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.9,
      reviewCount: 14,
    },
    {
      sellerId: pGreen,
      categoryId: categories["beauty"].id,
      title: "Raw Unrefined Grade A Ghana Shea Butter (25 kg / 55 lbs Block)",
      slug: "raw-unrefined-ghana-shea-butter-25kg",
      description: "Traditional handcrafted ivory shea butter packed with natural vitamins A, E, and F. Clean filtered with zero additives or deodorizers.",
      price: 155.0,
      compareAtPrice: 200.0,
      sku: "GE-SHEA-025",
      stock: 160,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 10 },
        { minQty: 20, discountPercent: 22 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.88,
      reviewCount: 24,
    },

    // --- BOOKS & STATIONERY (NovaTech & Hybrid) ---
    {
      sellerId: pHybrid,
      categoryId: categories["books"].id,
      title: "Hardcover Dotted Grid Engineer Notebooks 120 GSM (Carton of 50)",
      slug: "hardcover-dotted-grid-engineer-notebooks-50carton",
      description: "Fountain pen friendly bleed-resistant acid-free ivory pages. Expandable inner pocket, dual bookmark ribbons, and elastic closure band.",
      price: 260.0,
      compareAtPrice: 350.0,
      sku: "HY-BOK-050",
      stock: 190,
      moq: 2,
      wholesaleTiers: JSON.stringify([
        { minQty: 5, discountPercent: 12 },
        { minQty: 20, discountPercent: 24 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      ]),
      variants: JSON.stringify([
        { name: "Cover Color", options: ["Navy Blue", "Forest Green", "Charcoal Black"] },
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.9,
      reviewCount: 22,
    },
    {
      sellerId: pNova,
      categoryId: categories["books"].id,
      title: "Handbook of Industrial Automation & Robotics 5th Edition (Lot of 10)",
      slug: "handbook-industrial-automation-robotics-5th-ed",
      description: "Standard university and manufacturing plant reference text covering PLC programming, SCADA architecture, pneumatic actuators, and AI vision systems.",
      price: 750.0,
      compareAtPrice: 950.0,
      sku: "NV-TXT-010",
      stock: 40,
      moq: 1,
      wholesaleTiers: JSON.stringify([
        { minQty: 3, discountPercent: 10 },
        { minQty: 10, discountPercent: 20 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: true,
      isTrending: false,
      rating: 5.0,
      reviewCount: 8,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["books"].id,
      title: "Premium 0.5mm Archival Micro-Fineliner Pens Assortment (Box of 120)",
      slug: "archival-micro-fineliner-pens-120box",
      description: "Waterproof, lightfast pigmented ink compliant with ISO 14145-2 standards. Metal-clad precision nib designed for architects and draftsmen.",
      price: 110.0,
      compareAtPrice: 150.0,
      sku: "HY-PEN-120",
      stock: 240,
      moq: 3,
      wholesaleTiers: JSON.stringify([
        { minQty: 8, discountPercent: 14 },
        { minQty: 25, discountPercent: 25 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: false,
      rating: 4.85,
      reviewCount: 19,
    },
    {
      sellerId: pHybrid,
      categoryId: categories["books"].id,
      title: "Recycled Heavy Kraft Shipping Mailers 9x12 inch (Pack of 500)",
      slug: "recycled-heavy-kraft-shipping-mailers-500pack",
      description: "Self-sealing tamper-evident peel-and-stick adhesive strip with reinforced tear-strip opening. 100% biodegradable FSC certified.",
      price: 85.0,
      compareAtPrice: 115.0,
      sku: "HY-ENV-500",
      stock: 450,
      moq: 5,
      wholesaleTiers: JSON.stringify([
        { minQty: 10, discountPercent: 15 },
        { minQty: 40, discountPercent: 28 },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
      ]),
      isFeatured: false,
      isTrending: true,
      rating: 4.75,
      reviewCount: 30,
    },
  ];

  const createdProducts: any[] = [];
  for (const item of productsRaw) {
    const prod = await prisma.product.create({
      data: item,
    });
    createdProducts.push(prod);
  }

  console.log(`📦 Created ${createdProducts.length} high-quality products.`);

  // 4. Sample Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: createdProducts[0].id,
        userId: buyerUser1.id,
        rating: 5,
        comment: "Ordered 50 units for our corporate team. Outstanding sound quality and active noise cancellation is top notch. Delivery was ahead of schedule!",
        isVerifiedPurchase: true,
      },
      {
        productId: createdProducts[0].id,
        userId: buyerUser2.id,
        rating: 5,
        comment: "Solid wholesale margins on this model. Reselling very fast at our regional electronics branches.",
        isVerifiedPurchase: true,
      },
      {
        productId: createdProducts[6].id, // Ball valve
        userId: buyerUser3.id,
        rating: 5,
        comment: "Passes our plant hydraulic pressure tests with flying colors. Forging tolerance is precision grade. Highly recommended distributor.",
        isVerifiedPurchase: true,
      },
      {
        productId: createdProducts[17].id, // Coffee beans
        userId: buyerUser1.id,
        rating: 5,
        comment: "Incredible floral aroma and clean citrus notes. Our specialty roastery customers love this Ethiopian batch.",
        isVerifiedPurchase: true,
      },
      {
        productId: createdProducts[27].id, // T-shirts
        userId: buyerUser2.id,
        rating: 5,
        comment: "Fabric thickness and neckline ribbing are stellar. Best blank tees we've sourced in three years.",
        isVerifiedPurchase: true,
      },
    ],
  });

  // 5. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 4000.0,
        maxDiscount: 8000.0,
        isActive: true,
      },
      {
        code: "BULKSAVE15",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderValue: 25000.0,
        maxDiscount: 40000.0,
        isActive: true,
      },
      {
        code: "FREESHIP500",
        discountType: "FIXED",
        discountValue: 500.0,
        minOrderValue: 12000.0,
        maxDiscount: 500.0,
        isActive: true,
      },
    ],
  });

  console.log("🎟️ Coupons created.");

  // 6. Sample Orders in Different Statuses
  const sampleAddress = JSON.stringify({
    fullName: "Sophia Chen",
    phone: "+91 98456 78901",
    street: "1250 Logistic Park, Bhiwandi, Dock 4",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "421302",
    country: "India",
  });

  // Order 1: DELIVERED
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "DST-108291",
      userId: buyerUser1.id,
      status: "DELIVERED",
      subtotal: 78995.0,
      discount: 7899.5,
      couponCode: "WELCOME10",
      shippingCost: 0.0,
      tax: 5687.64,
      total: 76783.14,
      paymentMethod: "CARD",
      paymentStatus: "PAID",
      shippingAddress: sampleAddress,
      trackingNumber: "TRK-BLUEDART-992144",
      estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: "Please deliver to receiving dock bay 4 during business hours.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            sellerId: pNova,
            title: createdProducts[0].title,
            price: 15799.0,
            quantity: 5,
            total: 78995.0,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
            variant: "Color: Matte Black",
          },
        ],
      },
      timeline: {
        create: [
          { status: "PLACED", description: "Order DST-108291 placed by buyer." },
          { status: "CONFIRMED", description: "Payment verified. Seller NovaTech confirmed order." },
          { status: "PACKED", description: "Items securely crated and inspection tagged." },
          { status: "SHIPPED", description: "Dispatched via Blue Dart Express with tracking TRK-BLUEDART-992144." },
          { status: "DELIVERED", description: "Package signed for and delivered at dock." },
        ],
      },
    },
  });

  // Order 2: SHIPPED
  await prisma.order.create({
    data: {
      orderNumber: "DST-209482",
      userId: buyerUser2.id,
      status: "SHIPPED",
      subtotal: 53490.0,
      discount: 0.0,
      shippingCost: 0.0,
      tax: 4279.2,
      total: 57769.2,
      paymentMethod: "CARD",
      paymentStatus: "PAID",
      shippingAddress: sampleAddress,
      trackingNumber: "TRK-DELHIVERY-772183",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: createdProducts[6].id, // Ball valve
            sellerId: pApex,
            title: createdProducts[6].title,
            price: 5349.0,
            quantity: 10,
            total: 53490.0,
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      timeline: {
        create: [
          { status: "PLACED", description: "Order DST-209482 placed." },
          { status: "CONFIRMED", description: "Apex Industrial confirmed order." },
          { status: "PACKED", description: "Valves lubricated, sealed and boxed." },
          { status: "SHIPPED", description: "In transit with Delhivery Heavy Surface." },
        ],
      },
    },
  });

  // Order 3: PACKED
  await prisma.order.create({
    data: {
      orderNumber: "DST-304192",
      userId: buyerUser3.id,
      status: "PACKED",
      subtotal: 40999.0,
      discount: 0.0,
      shippingCost: 0.0,
      tax: 3279.92,
      total: 44278.92,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      shippingAddress: sampleAddress,
      notes: "Cash on delivery confirmed with procurement officer.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: createdProducts[17].id, // Coffee 60kg
            sellerId: pGreen,
            title: createdProducts[17].title,
            price: 40999.0,
            quantity: 1,
            total: 40999.0,
            image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      timeline: {
        create: [
          { status: "PLACED", description: "Order DST-304192 placed via COD." },
          { status: "CONFIRMED", description: "Seller GreenEarth confirmed stock availability." },
          { status: "PACKED", description: "Grain bag loaded onto transport pallet." },
        ],
      },
    },
  });

  // Order 4: PLACED
  await prisma.order.create({
    data: {
      orderNumber: "DST-401832",
      userId: buyerUser2.id,
      status: "PLACED",
      subtotal: 66198.0,
      discount: 9929.7,
      couponCode: "BULKSAVE15",
      shippingCost: 0.0,
      tax: 4501.46,
      total: 60769.76,
      paymentMethod: "CARD",
      paymentStatus: "PAID",
      shippingAddress: sampleAddress,
      createdAt: new Date(),
      items: {
        create: [
          {
            productId: createdProducts[1].id, // UltraSync 4K monitor
            sellerId: pNova,
            title: createdProducts[1].title,
            price: 33099.0,
            quantity: 2,
            total: 66198.0,
            image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      timeline: {
        create: [
          { status: "PLACED", description: "Order submitted and card authorization completed." },
        ],
      },
    },
  });

  // Order 5: CANCELLED
  await prisma.order.create({
    data: {
      orderNumber: "DST-508219",
      userId: buyerUser1.id,
      status: "CANCELLED",
      subtotal: 14899.0,
      discount: 0.0,
      shippingCost: 500.0,
      tax: 1191.92,
      total: 16590.92,
      paymentMethod: "CARD",
      paymentStatus: "REFUNDED",
      shippingAddress: sampleAddress,
      notes: "Buyer requested cancellation before dispatch due to duplicate requisition.",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: createdProducts[8].id, // Gloves
            sellerId: pApex,
            title: createdProducts[8].title,
            price: 14899.0,
            quantity: 1,
            total: 14899.0,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
      timeline: {
        create: [
          { status: "PLACED", description: "Order placed." },
          { status: "CANCELLED", description: "Cancelled upon buyer request. Refund credited to card." },
        ],
      },
    },
  });

  console.log("🛒 Sample orders across various statuses created.");

  // 7. Request for Quote (RFQ) & Quotes
  const rfq1 = await prisma.rFQ.create({
    data: {
      rfqNumber: "RFQ-2026-901",
      buyerId: buyerUser1.id,
      title: "Bulk Procurement: 500 units Industrial Grade Steel Valves & Flanges",
      category: "Industrial Supplies",
      description: "Looking for ISO 9001 certified manufacturer/distributor for continuous monthly supply of 2-inch stainless steel 316 ball valves with companion ANSI 150 flanges. Delivery to Bhiwandi logistics hub.",
      quantity: 500,
      targetPrice: 3950.0,
      deliveryLocation: "Bhiwandi Logistics Hub, Mumbai, Maharashtra",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "OPEN",
    },
  });

  await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      sellerId: pApex,
      unitPrice: 3750.0,
      totalPrice: 1875000.0,
      deliveryDays: 7,
      note: "Apex Hardware can fulfill immediately from our Peenya warehouse. Includes material test certificates (MTC 3.1) and free freight shipping across India.",
      status: "PENDING",
    },
  });

  await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      sellerId: pHybrid,
      unitPrice: 3890.0,
      totalPrice: 1945000.0,
      deliveryDays: 10,
      note: "Direct container delivery with stainless steel grade certification and 2-year warranty.",
      status: "PENDING",
    },
  });

  // Second RFQ
  await prisma.rFQ.create({
    data: {
      rfqNumber: "RFQ-2026-902",
      buyerId: buyerUser2.id,
      title: "Commercial Grade Bio-Fertilizer 20 Metric Tons",
      category: "Agriculture",
      description: "Need OMRI certified granular bio-fertilizer for commercial berry orchard expansion. Delivery required in 500kg super sacks.",
      quantity: 20,
      targetPrice: 48000.0,
      deliveryLocation: "APMC Yard, Nashik, Maharashtra",
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "OPEN",
      quotes: {
        create: [
          {
            sellerId: pGreen,
            unitPrice: 46500.0,
            totalPrice: 930000.0,
            deliveryDays: 12,
            note: "GreenEarth can provide palletized super-sacks with batch lab testing.",
            status: "PENDING",
          },
        ],
      },
    },
  });

  console.log("📑 RFQs and Quotes created.");

  // 8. Sample Messages (Buyer <-> Seller)
  await prisma.message.createMany({
    data: [
      {
        senderId: buyerUser1.id,
        receiverId: sellerUser1.id,
        content: "Hi Marcus, we received the first batch of stainless valves. Quality is superb. Can we get priority booking on the next 100 units?",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true,
      },
      {
        senderId: sellerUser1.id,
        receiverId: buyerUser1.id,
        content: "Hello Sophia! Absolutely, I have reserved 100 units under your account at the tier 3 discount price. You can place the order anytime.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
      },
    ],
  });

  // 9. Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: buyerUser1.id,
        title: "Order Delivered!",
        message: "Your order DST-108291 has been safely delivered to your address.",
        type: "ORDER",
        link: "/buyer/orders/DST-108291",
        isRead: false,
      },
      {
        userId: buyerUser1.id,
        title: "New Quote Received",
        message: "Apex Industrial submitted a competitive quote of ₹3,750/unit for RFQ-2026-901.",
        type: "RFQ",
        link: "/buyer/rfq",
        isRead: false,
      },
      {
        userId: sellerUser1.id,
        title: "New Order Received",
        message: "Buyer Liam placed order DST-209482 for 10x Stainless Steel Ball Valves.",
        type: "ORDER",
        link: "/seller/orders",
        isRead: true,
      },
    ],
  });

  // 10. Sample Payouts
  await prisma.payout.createMany({
    data: [
      {
        sellerId: pApex,
        amount: 700000.0,
        method: "RTGS Bank Transfer (HDFC Bank)",
        reference: "RTGS-HDFC-88912304",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        sellerId: pNova,
        amount: 1250000.0,
        method: "NEFT Bank Transfer (ICICI Bank)",
        reference: "NEFT-ICIC-33918274",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 11. Platform Settings & Disputes
  await prisma.platformSetting.createMany({
    data: [
      { key: "commission_rate", value: "5.0" },
      { key: "default_tax_rate", value: "8.0" },
      { key: "platform_currency", value: "INR" },
      { key: "platform_name", value: "Distributeder" },
      { key: "contact_email", value: "support@distributeder.com" },
    ],
  });

  await prisma.disputeReport.create({
    data: {
      reporterId: buyerUser3.id,
      reportedUserId: sellerUser2.id,
      type: "PRODUCT",
      subject: "Specification inquiry on server switch firmware",
      description: "Buyer inquired about enterprise firmware version compatibility on 24-port PoE switch. Seller provided updated documentation.",
      status: "RESOLVED",
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
