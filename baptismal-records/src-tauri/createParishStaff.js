const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function createParishStaff() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 4) {
      throw new Error(
        "Invalid number of arguments. Expected: name, title, role, createdBy"
      );
    }

    const [name, title, role, createdBy] = args;

    // Parse and validate createdBy
    const parsedCreatedBy = parseInt(createdBy);
    if (isNaN(parsedCreatedBy)) {
      throw new Error("Invalid createdBy user ID");
    }

    // Validate required fields
    if (!name || name.trim() === "") {
      throw new Error("Name is required");
    }

    // Check if staff member with same name already exists
    const existingStaff = await prisma.parishStaff.findFirst({
      where: {
        name: name.trim(),
        active: true,
      },
    });

    if (existingStaff) {
      throw new Error(
        `Parish staff member with name "${name.trim()}" already exists`
      );
    }

    // Create the parish staff record
    const newStaff = await prisma.parishStaff.create({
      data: {
        name: name.trim(),
        title: title && title.trim() !== "" ? title.trim() : null,
        role: role && role.trim() !== "" ? role.trim() : null,
        active: true,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: parsedCreatedBy,
        action: "CREATE",
        tableName: "ParishStaff",
        recordId: newStaff.id,
        oldValues: null, // No old values for creation
        newValues: JSON.stringify({
          id: newStaff.id,
          name: newStaff.name,
          title: newStaff.title,
          role: newStaff.role,
          active: newStaff.active,
          createdAt: newStaff.createdAt.toISOString(),
          updatedAt: newStaff.updatedAt.toISOString(),
        }),
        ipAddress: null, // Could be passed from frontend if needed
        userAgent: null, // Could be passed from frontend if needed
        notes: `Created parish staff member: ${newStaff.name}${
          newStaff.title ? ` (${newStaff.title})` : ""
        }`,
      },
    });

    // Return success response with the created record
    const response = {
      success: true,
      staff: {
        id: newStaff.id,
        name: newStaff.name,
        title: newStaff.title,
        role: newStaff.role,
        active: newStaff.active,
        createdAt: newStaff.createdAt.toISOString(),
        updatedAt: newStaff.updatedAt.toISOString(),
      },
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

createParishStaff();
