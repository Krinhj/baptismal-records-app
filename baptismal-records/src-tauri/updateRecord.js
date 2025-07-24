const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function updateBaptismRecord() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length < 8) {
      throw new Error(
        "Missing required arguments. Expected: recordId, childName, fatherName, motherName, birthDate, birthPlace, baptismDate, priestName"
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
    ] = args;

    const recordId = parseInt(recordIdStr);
    if (isNaN(recordId)) {
      throw new Error("Invalid record ID");
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
      }
    );

    // Check if record exists first
    const existingRecord = await prisma.baptismRecord.findUnique({
      where: { id: recordId },
    });

    if (!existingRecord) {
      throw new Error(`Record with ID ${recordId} not found`);
    }

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
