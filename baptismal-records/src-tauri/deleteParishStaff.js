const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function deleteParishStaff() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 2) {
      throw new Error(
        "Invalid number of arguments. Expected: staffId, deletedBy"
      );
    }

    const [staffIdStr, deletedBy] = args;

    const staffId = parseInt(staffIdStr);
    const parsedDeletedBy = parseInt(deletedBy);

    if (isNaN(staffId)) {
      throw new Error("Invalid staff ID");
    }

    if (isNaN(parsedDeletedBy)) {
      throw new Error("Invalid deletedBy user ID");
    }

    // Check if staff member exists
    const existingStaff = await prisma.parishStaff.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      throw new Error(`Parish staff member with ID ${staffId} not found`);
    }

    // Store original data for audit log
    const originalStaffData = {
      id: existingStaff.id,
      name: existingStaff.name,
      title: existingStaff.title,
      role: existingStaff.role,
      active: existingStaff.active,
      createdAt: existingStaff.createdAt.toISOString(),
      updatedAt: existingStaff.updatedAt.toISOString(),
    };

    // Check if this staff member is referenced in any baptism records
    const referencedRecords = await prisma.baptismRecord.findMany({
      where: {
        priestName: existingStaff.name,
      },
      select: {
        id: true,
        childName: true,
      },
    });

    if (referencedRecords.length > 0) {
      // Soft delete - mark as inactive instead of hard delete
      const updatedStaff = await prisma.parishStaff.update({
        where: { id: staffId },
        data: {
          active: false,
          updatedAt: new Date(),
        },
      });

      const newStaffData = {
        id: updatedStaff.id,
        name: updatedStaff.name,
        title: updatedStaff.title,
        role: updatedStaff.role,
        active: updatedStaff.active,
        createdAt: updatedStaff.createdAt.toISOString(),
        updatedAt: updatedStaff.updatedAt.toISOString(),
      };

      // Create audit log entry for soft delete (UPDATE action)
      await prisma.auditLog.create({
        data: {
          userId: parsedDeletedBy,
          action: "UPDATE",
          tableName: "ParishStaff",
          recordId: updatedStaff.id,
          oldValues: JSON.stringify(originalStaffData),
          newValues: JSON.stringify(newStaffData),
          ipAddress: null,
          userAgent: null,
          notes: `Deactivated parish staff member: ${updatedStaff.name}${
            updatedStaff.title ? ` (${updatedStaff.title})` : ""
          } - Referenced in ${referencedRecords.length} baptism records`,
        },
      });

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
        message: `Parish staff member deactivated (referenced in ${referencedRecords.length} baptism records)`,
        referencedRecords: referencedRecords.length,
      };

      console.log(JSON.stringify(response));
    } else {
      // Hard delete - safe to remove completely
      const deletedStaff = await prisma.parishStaff.delete({
        where: { id: staffId },
      });

      // Create audit log entry for hard delete (DELETE action)
      await prisma.auditLog.create({
        data: {
          userId: parsedDeletedBy,
          action: "DELETE",
          tableName: "ParishStaff",
          recordId: staffId,
          oldValues: JSON.stringify(originalStaffData),
          newValues: null, // Nothing exists after deletion
          ipAddress: null,
          userAgent: null,
          notes: `Deleted parish staff member: ${existingStaff.name}${
            existingStaff.title ? ` (${existingStaff.title})` : ""
          } - No references found`,
        },
      });

      const response = {
        success: true,
        staff: {
          id: deletedStaff.id,
          name: deletedStaff.name,
          title: deletedStaff.title,
          role: deletedStaff.role,
          active: deletedStaff.active,
          createdAt: deletedStaff.createdAt.toISOString(),
          updatedAt: deletedStaff.updatedAt.toISOString(),
        },
        message: "Parish staff member deleted successfully",
        referencedRecords: 0,
      };

      console.log(JSON.stringify(response));
    }
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

deleteParishStaff();
