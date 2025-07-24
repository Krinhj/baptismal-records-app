const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function updateParishStaff() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 5) {
      throw new Error(
        "Invalid number of arguments. Expected: staffId, name, title, role, updatedBy"
      );
    }

    const [staffIdStr, name, title, role, updatedBy] = args;

    const staffId = parseInt(staffIdStr);
    const parsedUpdatedBy = parseInt(updatedBy);

    if (isNaN(staffId)) {
      throw new Error("Invalid staff ID");
    }

    if (isNaN(parsedUpdatedBy)) {
      throw new Error("Invalid updatedBy user ID");
    }

    // Validate required fields
    if (!name || name.trim() === "") {
      throw new Error("Name is required");
    }

    // Check if staff member exists and get old values
    const existingStaff = await prisma.parishStaff.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      throw new Error(`Parish staff member with ID ${staffId} not found`);
    }

    // Store old values for audit log
    const oldValues = {
      id: existingStaff.id,
      name: existingStaff.name,
      title: existingStaff.title,
      role: existingStaff.role,
      active: existingStaff.active,
      createdAt: existingStaff.createdAt.toISOString(),
      updatedAt: existingStaff.updatedAt.toISOString(),
    };

    // Check if another staff member with same name already exists (excluding current staff)
    const duplicateStaff = await prisma.parishStaff.findFirst({
      where: {
        name: name.trim(),
        active: true,
        NOT: {
          id: staffId,
        },
      },
    });

    if (duplicateStaff) {
      throw new Error(
        `Another parish staff member with name "${name.trim()}" already exists`
      );
    }

    // Update the parish staff record
    const updatedStaff = await prisma.parishStaff.update({
      where: { id: staffId },
      data: {
        name: name.trim(),
        title: title && title.trim() !== "" ? title.trim() : null,
        role: role && role.trim() !== "" ? role.trim() : null,
        updatedAt: new Date(),
      },
    });

    // Store new values for audit log
    const newValues = {
      id: updatedStaff.id,
      name: updatedStaff.name,
      title: updatedStaff.title,
      role: updatedStaff.role,
      active: updatedStaff.active,
      createdAt: updatedStaff.createdAt.toISOString(),
      updatedAt: updatedStaff.updatedAt.toISOString(),
    };

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: parsedUpdatedBy,
        action: "UPDATE",
        tableName: "ParishStaff",
        recordId: updatedStaff.id,
        oldValues: JSON.stringify(oldValues),
        newValues: JSON.stringify(newValues),
        ipAddress: null, // Could be passed from frontend if needed
        userAgent: null, // Could be passed from frontend if needed
        notes: `Updated parish staff member: ${updatedStaff.name}${
          updatedStaff.title ? ` (${updatedStaff.title})` : ""
        }`,
      },
    });

    // Return success response with the updated record
    const response = {
      success: true,
      staff: {
        id: updatedStaff.id,
        name: updatedStaff.name,
        title: updatedStaff.title,
        role: updatedStaff.role,
        active: updatedStaff.active,
        createdAt: updatedStaff.createdAt.toISOString(),
        updatedAt: updatedStaff.updatedAt.toISOString(),
      },
      message: "Parish staff member updated successfully",
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

updateParishStaff();
