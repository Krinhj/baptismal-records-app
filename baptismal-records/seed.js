const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@parish.com",
      password: "admin123",
      role: "ADMIN", // or "USER", depending on your enum values
    },
  });

  console.log("✅ Admin user seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
