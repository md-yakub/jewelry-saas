import { PrismaClient, RoleCode } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const devShop = {
  name: "Royal Gold Jewellers",
  slug: "royal-gold-jewellers",
  email: "owner@royalgold.example",
  phone: "+91 98765 43210",
  address: "12 MG Road, Bengaluru, Karnataka",
};

const devOwner = {
  name: "Aarav Mehta",
  email: "owner@royalgold.example",
  phone: "+91 98765 43210",
  password: "Str0ngPass!2026",
};

async function main() {
  const passwordHash = await bcrypt.hash(devOwner.password, 10);

  const shop = await prisma.shop.upsert({
    where: { slug: devShop.slug },
    update: {
      name: devShop.name,
      email: devShop.email,
      phone: devShop.phone,
      address: devShop.address,
    },
    create: devShop,
  });

  const owner = await prisma.user.upsert({
    where: { email: devOwner.email },
    update: {
      name: devOwner.name,
      phone: devOwner.phone,
      passwordHash,
      isActive: true,
    },
    create: {
      name: devOwner.name,
      email: devOwner.email,
      phone: devOwner.phone,
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
    update: {
      role: RoleCode.SHOP_OWNER,
    },
    create: {
      shopId: shop.id,
      userId: owner.id,
      role: RoleCode.SHOP_OWNER,
    },
  });

  console.log("Development shop owner seeded.");
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
