import "dotenv/config";
import crypto from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../lib/prisma";

const rawEmail = process.env.SEED_ADMIN_EMAIL?.trim();
const rawPassword = process.env.SEED_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME?.trim() || "Admin Tech Bro";

if (!rawEmail || !rawPassword) {
  console.error(
    "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in your environment (.env).",
  );
  process.exit(1);
}

if (rawPassword.length < 8) {
  console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const ADMIN_EMAIL = rawEmail.toLowerCase();
const ADMIN_PASSWORD = rawPassword;

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: { accounts: true },
  });

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: ADMIN_NAME,
        role: "admin",
        emailVerified: true,
        banned: false,
      },
    });

    const credentialAccount = existingUser.accounts.find(
      (account) => account.providerId === "credential",
    );

    if (credentialAccount) {
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: existingUser.id,
          providerId: "credential",
          userId: existingUser.id,
          password: passwordHash,
        },
      });
    }

    console.log(`Updated existing admin account: ${ADMIN_EMAIL}`);
  } else {
    const userId = crypto.randomUUID();

    await prisma.user.create({
      data: {
        id: userId,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        emailVerified: true,
        role: "admin",
        banned: false,
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: userId,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
    });

    console.log(`Created admin account: ${ADMIN_EMAIL}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed admin account:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
