const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function deleteBaptismRecord() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 2) {
      throw new Error(
        "Invalid number of arguments. Expected: recordId, deletedBy"
      );
    }

    const [recordId, deletedBy] = args;

    // Parse and validate arguments
    const parsedRecordId = parseInt(recordId);
    const parsedDeletedBy = parseInt(deletedBy);

    if (isNaN(parsedRecordId)) {
      throw new Error("Invalid record ID format");
    }

    if (isNaN(parsedDeletedBy)) {
      throw new Error("Invalid user ID format");
    }

    // Check if record exists before deletion
    const existingRecord = await prisma.baptismRecord.findUnique({
      where: { id: parsedRecordId },
    });

    if (!existingRecord) {
      throw new Error("Record not found");
    }

    // Store record data for audit log (before deletion)
    const recordForAudit = {
      id: existingRecord.id,
      childName: existingRecord.childName,
      fatherName: existingRecord.fatherName,
      motherName: existingRecord.motherName,
      birthDate: existingRecord.birthDate.toISOString(),
      birthPlace: existingRecord.birthPlace,
      baptismDate: existingRecord.baptismDate.toISOString(),
      priestName: existingRecord.priestName,
      createdAt: existingRecord.createdAt.toISOString(),
      updatedAt: existingRecord.updatedAt.toISOString(),
      createdBy: existingRecord.createdBy,
    };

    // Delete the record
    await prisma.baptismRecord.delete({
      where: { id: parsedRecordId },
    });

    // TODO: In the future, we can add audit logging here
    // await prisma.auditLog.create({
    //   data: {
    //     userId: parsedDeletedBy,
    //     action: "DELETE",
    //     tableName: "BaptismRecord",
    //     recordId: parsedRecordId,
    //     oldData: JSON.stringify(recordForAudit),
    //     newData: null,
    //   }
    // });

    // Return success response
    const response = {
      success: true,
      message: "Record deleted successfully",
      deletedRecord: recordForAudit,
    };

    console.log(JSON.stringify(response));
  } catch (error) {
    // Return error response
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

deleteBaptismRecord();
