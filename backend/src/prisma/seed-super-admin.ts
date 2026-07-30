import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.SUPER_ADMIN_NAME ?? "Super Admin";
  const email = (process.env.SUPER_ADMIN_EMAIL ?? "admin@example.local")
    .trim()
    .toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "change-me";
  const resetPassword = process.env.SUPER_ADMIN_RESET_PASSWORD === "true";

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordMatchesConfiguredPassword = existing?.passwordHash
    ? await bcrypt.compare(password, existing.passwordHash)
    : false;
  const shouldWritePassword =
    !existing?.passwordHash || resetPassword || !passwordMatchesConfiguredPassword;
  const passwordHash = shouldWritePassword
    ? await bcrypt.hash(password, 10)
    : undefined;
  const createPasswordHash = passwordHash ?? (await bcrypt.hash(password, 10));

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      isSuperAdmin: true,
      isActive: true,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      name,
      email,
      passwordHash: createPasswordHash,
      isSuperAdmin: true,
      isActive: true,
    },
  });

  console.log("Development Super Admin seeded.");
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
