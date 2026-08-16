import {
  Carat,
  ItemStatus,
  Prisma,
  PrismaClient,
  RoleCode,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ITEM_COUNT = 10_000;
const BATCH_SIZE = 1_000;
const PERFORMANCE_SKU_PREFIX = "PERF";

const performanceShop = {
  name: "Benchmark Jewelry Store",
  slug: "performance-benchmark-jewelry",
  email: "benchmark-shop@example.local",
  phone: "+1 555 010 9000",
  address: "100 Benchmark Avenue, Test City",
  currencyCode: "USD",
  locale: "en-US",
};

const performanceOwner = {
  name: "Performance Test Owner",
  email: "performance-owner@example.local",
  phone: "+1 555 010 9001",
  password: process.env.PERFORMANCE_SEED_PASSWORD ?? "PerformanceOnly!2026",
};

const categoryDefinitions = [
  ["Rings", "Engagement, wedding, and fashion rings"],
  ["Necklaces", "Gold necklaces and statement pieces"],
  ["Bracelets", "Chain, cuff, and charm bracelets"],
  ["Earrings", "Stud, hoop, drop, and chandelier earrings"],
  ["Bangles", "Classic and contemporary gold bangles"],
  ["Pendants", "Gold and gemstone pendants"],
  ["Chains", "Everyday and premium gold chains"],
  ["Anklets", "Traditional and modern anklets"],
  ["Brooches", "Decorative gold and gemstone brooches"],
  ["Wedding Sets", "Coordinated jewelry sets for weddings"],
] as const;

const caratRates: Record<Carat, number> = {
  [Carat.K18]: 54,
  [Carat.K21]: 63,
  [Carat.K22]: 66,
  [Carat.K24]: 72,
};
const designs = [
  "Classic",
  "Floral",
  "Heritage",
  "Geometric",
  "Celestial",
  "Minimalist",
  "Royal",
  "Vintage",
] as const;

function deterministicFraction(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

function decimal(value: number, scale: number) {
  return new Prisma.Decimal(value.toFixed(scale));
}

function statusFor(index: number): ItemStatus {
  const bucket = deterministicFraction(index, 8);
  if (bucket < 0.72) return ItemStatus.AVAILABLE;
  if (bucket < 0.9) return ItemStatus.RESERVED;
  return ItemStatus.SOLD;
}

function caratFor(index: number): Carat {
  const bucket = deterministicFraction(index, 9);
  if (bucket < 0.15) return Carat.K18;
  if (bucket < 0.3) return Carat.K21;
  if (bucket < 0.8) return Carat.K22;
  return Carat.K24;
}

function buildItem(
  index: number,
  shopId: string,
  categories: Array<{ id: string; name: string }>,
  now: Date,
): Prisma.JewelryItemCreateManyInput {
  const sequence = index + 1;
  const category = categories[index % categories.length];
  const carat = caratFor(index);
  const design = designs[(index * 5 + 3) % designs.length];
  const goldWeight = 1.5 + deterministicFraction(index, 1) * 78.5;
  const stoneRatio = deterministicFraction(index, 2) * 0.14;
  const stoneWeight = goldWeight * stoneRatio;
  const netGoldWeight = goldWeight - stoneWeight;
  const makingCharge = 25 + deterministicFraction(index, 3) * 475;
  const wastagePercentage = 1 + deterministicFraction(index, 4) * 11;
  const stonePrice =
    stoneWeight > 0.25
      ? 20 + deterministicFraction(index, 5) * 1_480
      : 0;
  const purchaseCost =
    netGoldWeight * caratRates[carat] + stonePrice + makingCharge * 0.65;
  const sellingPriceEstimate =
    purchaseCost * (1.12 + deterministicFraction(index, 6) * 0.18);
  const createdAt = new Date(now);
  createdAt.setUTCDate(
    createdAt.getUTCDate() - Math.floor(deterministicFraction(index, 7) * 730),
  );
  createdAt.setUTCHours(index % 24, (index * 13) % 60, (index * 17) % 60, 0);

  return {
    shopId,
    categoryId: category.id,
    name: `${design} ${category.name.slice(0, -1)} ${String(sequence).padStart(5, "0")}`,
    sku: `${PERFORMANCE_SKU_PREFIX}-${category.name.slice(0, 3).toUpperCase()}-${String(sequence).padStart(6, "0")}`,
    barcode: `8907${String(sequence).padStart(9, "0")}`,
    goldWeight: decimal(goldWeight, 3),
    stoneWeight: decimal(stoneWeight, 3),
    netGoldWeight: decimal(netGoldWeight, 3),
    carat,
    makingCharge: decimal(makingCharge, 2),
    wastagePercentage: decimal(wastagePercentage, 2),
    stonePrice: decimal(stonePrice, 2),
    status: statusFor(index),
    purchaseCost: decimal(purchaseCost, 2),
    sellingPriceEstimate: decimal(sellingPriceEstimate, 2),
    createdAt,
  };
}

async function main() {
  if (process.env.NODE_ENV?.toLowerCase() === "production") {
    throw new Error("The performance seed cannot run with NODE_ENV=production.");
  }

  const passwordHash = await bcrypt.hash(performanceOwner.password, 10);

  const shop = await prisma.shop.upsert({
    where: { slug: performanceShop.slug },
    update: {
      ...performanceShop,
      isActive: true,
    },
    create: performanceShop,
  });

  const owner = await prisma.user.upsert({
    where: { email: performanceOwner.email },
    update: {
      name: performanceOwner.name,
      phone: performanceOwner.phone,
      passwordHash,
      isActive: true,
    },
    create: {
      name: performanceOwner.name,
      email: performanceOwner.email,
      phone: performanceOwner.phone,
      passwordHash,
    },
  });

  await prisma.shopMember.upsert({
    where: {
      shopId_userId: {
        shopId: shop.id,
        userId: owner.id,
      },
    },
    update: { role: RoleCode.SHOP_OWNER },
    create: {
      shopId: shop.id,
      userId: owner.id,
      role: RoleCode.SHOP_OWNER,
    },
  });

  const categories: Array<{ id: string; name: string }> = [];
  for (const [name, description] of categoryDefinitions) {
    const category = await prisma.jewelryCategory.upsert({
      where: { shopId_name: { shopId: shop.id, name } },
      update: { description },
      create: { shopId: shop.id, name, description },
      select: { id: true, name: true },
    });
    categories.push(category);
  }

  const now = new Date();
  for (let offset = 0; offset < ITEM_COUNT; offset += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, ITEM_COUNT - offset);
    const data = Array.from({ length: batchSize }, (_, batchIndex) =>
      buildItem(offset + batchIndex, shop.id, categories, now),
    );

    await prisma.jewelryItem.createMany({
      data,
      skipDuplicates: true,
    });
  }

  const itemCount = await prisma.jewelryItem.count({
    where: {
      shopId: shop.id,
      sku: { startsWith: `${PERFORMANCE_SKU_PREFIX}-` },
    },
  });

  console.log(
    `Performance dataset ready: shop=${shop.slug}, categories=${categories.length}, items=${itemCount}.`,
  );
  console.log(`Owner login: ${performanceOwner.email}`);
}

void main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
