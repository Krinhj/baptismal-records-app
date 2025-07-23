const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  // Create SUPER_ADMIN (you)
  await prisma.user.create({
    data: {
      name: "System Administrator",
      username: "dev",
      password: "0604010326riven", // Change this to whatever you want
      role: "SUPER_ADMIN",
    },
  });

  // Create ADMIN (your uncle)
  await prisma.user.create({
    data: {
      name: "Parish Priest",
      username: "admin",
      password: "admin123",
      role: "ADMIN",
    },
  });

  // Create a sample USER (staff member)
  await prisma.user.create({
    data: {
      name: "Church Staff",
      username: "staff",
      password: "staff123",
      role: "USER",
    },
  });

  console.log("✅ Users seeded with new username system:");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
