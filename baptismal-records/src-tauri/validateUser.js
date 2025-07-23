const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function validateUser() {
  try {
    const [username, password] = process.argv.slice(2);

    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { username: username }, // Changed from email
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.password !== password) {
      throw new Error("Invalid password");
    }

    // Return user data as JSON
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username, // Changed from email
      role: user.role,
    };
    console.log(JSON.stringify(userData));
  } catch (error) {
    console.error("Authentication failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateUser();
