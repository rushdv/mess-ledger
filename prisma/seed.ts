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
    },
  });

  // Create sample members
  const memberPassword = await bcrypt.hash("member123", 12);
  const memberData = [
    { name: "Rahim", email: "rahim@messledger.com", phone: "01711111111" },
    { name: "Karim", email: "karim@messledger.com", phone: "01722222222" },
    { name: "Jamal", email: "jamal@messledger.com", phone: "01733333333" },
  ];

  const members = [];
  for (const m of memberData) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        name: m.name,
        password: memberPassword,
        role: "MEMBER",
      },
    });
    members.push({ user, phone: m.phone });
  }

  // Check if demo mess already exists
  let demoMess = await prisma.mess.findUnique({
    where: { code: "DEMO2024" },
  });

  if (!demoMess) {
    demoMess = await prisma.mess.create({
      data: {
        name: "Demo Mess",
        code: "DEMO2024",
        description: "Demo mess for testing",
        createdBy: admin.id,
      },
    });

    console.log(`✅ Created mess: ${demoMess.name} (Code: ${demoMess.code})`);

    // Add admin as mess admin
    await prisma.messMember.upsert({
      where: { userId_messId: { userId: admin.id, messId: demoMess.id } },
      update: {},
      create: {
        userId: admin.id,
        messId: demoMess.id,
        role: "ADMIN",
      },
    });

    // Create Member record for admin
    await prisma.member.upsert({
      where: { userId_messId: { userId: admin.id, messId: demoMess.id } },
      update: {},
      create: {
        userId: admin.id,
        messId: demoMess.id,
        phone: "01700000000",
      },
    });

    // Add members to the mess
    for (const m of members) {
      await prisma.messMember.upsert({
        where: { userId_messId: { userId: m.user.id, messId: demoMess.id } },
        update: {},
        create: {
          userId: m.user.id,
          messId: demoMess.id,
          role: "MEMBER",
        },
      });

      await prisma.member.upsert({
        where: { userId_messId: { userId: m.user.id, messId: demoMess.id } },
        update: {},
        create: {
          userId: m.user.id,
          messId: demoMess.id,
          phone: m.phone,
        },
      });
    }
  } else {
    console.log(`ℹ️ Demo mess ${demoMess.code} already exists, skipping creation.`);
  }

  console.log("✅ Seed complete!");
  console.log("   Admin: admin@messledger.com / admin123");
  console.log("   Members: rahim/karim/jamal@messledger.com / member123");
  console.log(`   Mess Code: DEMO2024`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
