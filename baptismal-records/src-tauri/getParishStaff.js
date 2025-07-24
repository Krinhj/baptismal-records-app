const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function getParishStaff() {
  try {
    // Get all active parish staff members, ordered by name
    const staffMembers = await prisma.parishStaff.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format the response
    const formattedStaff = staffMembers.map((staff) => ({
      id: staff.id,
      name: staff.name,
      title: staff.title,
      role: staff.role,
      active: staff.active,
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
    }));

    // Return success response
    const response = {
      success: true,
      staff: formattedStaff,
      count: staffMembers.length,
    };

    console.log(JSON.stringify(response));
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.message,
    };
    console.error(JSON.stringify(errorResponse));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getParishStaff();
