const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
      orderBy: {
        name: "asc", // Alphabetical order for the dropdown
      },
    });

    // ADD THIS: Output the data for Tauri to capture
    const response = {
      success: true,
      users: users,
      count: users.length,
    };

    console.log(JSON.stringify(response));
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);

    // ADD THIS: Output error response for Tauri to capture
    const errorResponse = {
      success: false,
      error: error.message,
    };

    console.log(JSON.stringify(errorResponse));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the function immediately (remove the conditional)
getAllUsers();
