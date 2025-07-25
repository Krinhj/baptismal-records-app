const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function updateBaptismRecord() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    // Debug: Log the actual arguments received
    console.error(
      `🔍 [updateRecord.js] Received ${args.length} arguments:`,
      args
    );

    if (args.length < 9) {
      throw new Error(
        `Missing required arguments. Expected 9, got ${args.length}. Expected: record_id, child_name, father_name, mother_name, birth_date, birth_place, baptism_date, priest_name, updated_by`
      );
    }

    const [
      recordIdStr,
      childName,
      fatherName,
      motherName,
      birthDate,
      birthPlace,
      baptismDate,
      priestName,
      updatedBy,
    ] = args;

    const recordId = parseInt(recordIdStr);
    const parsedUpdatedBy = parseInt(updatedBy);

    if (isNaN(recordId)) {
      throw new Error(`Invalid record_id: ${recordIdStr}`);
    }

    if (isNaN(parsedUpdatedBy)) {
      throw new Error(`Invalid updated_by user ID: ${updatedBy}`);
    }

    console.error(
      `🔍 [updateRecord.js] Updating record ${recordId} with data:`,
      {
        childName,
        fatherName: fatherName || null,
        motherName: motherName || null,
        birthDate,
        birthPlace,
        baptismDate,
        priestName,
        updatedBy: parsedUpdatedBy,
      }
    );

    // Check if record exists first and get the old values
    const existingRecord = await prisma.baptismRecord.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new Error(`Record with ID ${recordId} not found`);
    }

    // Store old values for audit log
    const oldValues = {
      id: existingRecord.id,
      childName: existingRecord.childName,
      fatherName: existingRecord.fatherName,
      motherName: existingRecord.motherName,
      birthDate: existingRecord.birthDate.toISOString(),
      birthPlace: existingRecord.birthPlace,
      baptismDate: existingRecord.baptismDate.toISOString(),
      priestName: existingRecord.priestName,
      createdBy: existingRecord.createdBy,
    };

    // Update the record
    const updatedRecord = await prisma.baptismRecord.update({
      where: { id: recordId },
      data: {
        childName: childName.trim(),
        fatherName: fatherName.trim() || null,
        motherName: motherName.trim() || null,
        birthDate: new Date(birthDate),
        birthPlace: birthPlace.trim(),
        baptismDate: new Date(baptismDate),
        priestName: priestName.trim(),
        updatedAt: new Date(),
      },
    });

    // Store new values for audit log
    const newValues = {
      id: updatedRecord.id,
      childName: updatedRecord.childName,
      fatherName: updatedRecord.fatherName,
      motherName: updatedRecord.motherName,
      birthDate: updatedRecord.birthDate.toISOString(),
      birthPlace: updatedRecord.birthPlace,
      baptismDate: updatedRecord.baptismDate.toISOString(),
      priestName: updatedRecord.priestName,
      createdBy: updatedRecord.createdBy,
    };

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: parsedUpdatedBy,
        action: "UPDATE",
        tableName: "BaptismRecord",
        recordId: updatedRecord.id,
        oldValues: JSON.stringify(oldValues),
        newValues: JSON.stringify(newValues),
        ipAddress: null, // Could be passed from frontend if needed
        userAgent: null, // Could be passed from frontend if needed
        notes: `Updated baptism record for ${updatedRecord.childName}`,
      },
    });

    console.error(
      `✅ [updateRecord.js] Record updated successfully:`,
      updatedRecord
    );

    // Return success response
    const response = {
      success: true,
      record: {
        id: updatedRecord.id,
        childName: updatedRecord.childName,
        fatherName: updatedRecord.fatherName,
        motherName: updatedRecord.motherName,
        birthDate: updatedRecord.birthDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        birthPlace: updatedRecord.birthPlace,
        baptismDate: updatedRecord.baptismDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        priestName: updatedRecord.priestName,
        createdAt: updatedRecord.createdAt.toISOString(),
        updatedAt: updatedRecord.updatedAt.toISOString(),
      },
      message: "Record updated successfully",
    };

    console.log(JSON.stringify(response));
    process.exit(0);
  } catch (error) {
    console.error(`❌ [updateRecord.js] Error:`, error.message);

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

// Run the function
updateBaptismRecord();
