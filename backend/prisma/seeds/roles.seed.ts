import { PrismaClient, RoleCode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      code: RoleCode.SUPER_ADMIN,
      name: "Super Admin",
      description: "Access to all shops and admin-level capabilities",
    },
    {
      code: RoleCode.SHOP_OWNER,
      name: "Shop Owner",
      description: "Owner-level access to one shop",
    },
    {
      code: RoleCode.MANAGER,
      name: "Manager",
      description: "Can manage inventory, rates and sales for one shop",
    },
    {
      code: RoleCode.STAFF,
      name: "Staff",
      description: "Can create sales and operate POS workflows",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }
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
