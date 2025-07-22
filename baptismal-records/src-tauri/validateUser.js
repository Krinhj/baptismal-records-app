const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const [, , email, password] = process.argv;

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password === password) {
      console.log("User Authenticated");
      process.exit(0); // success
    } else {
      console.log("Authentication Failed");
      process.exit(1); // invalid
    }
  } catch (error) {
    console.error("Prisma validation error:", error);
    process.exit(1);
  }
})();
