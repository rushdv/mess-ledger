import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@messledger.com" },
    update: {},
    create: {
      email: "admin@messledger.com",
      name: "Mess Admin",
      password: adminPassword,
      role: "ADMIN",
      member: {
        create: {
          phone: "01700000000",
        },
      },
    },
  });

  // Create sample members
  const memberPassword = await bcrypt.hash("member123", 12);
  const memberData = [
    { name: "Rahim", email: "rahim@messledger.com", phone: "01711111111" },
    { name: "Karim", email: "karim@messledger.com", phone: "01722222222" },
    { name: "Jamal", email: "jamal@messledger.com", phone: "01733333333" },
  ];

  for (const m of memberData) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        name: m.name,
        password: memberPassword,
        role: "MEMBER",
        member: {
          create: { phone: m.phone },
        },
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log("   Admin: admin@messledger.com / admin123");
  console.log("   Members: rahim/karim/jamal@messledger.com / member123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
