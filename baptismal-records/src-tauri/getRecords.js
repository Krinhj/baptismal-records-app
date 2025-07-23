const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function getBaptismRecords() {
  try {
    // Fetch records from database
    const records = await prisma.baptismRecord.findMany({
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    // Format the records for frontend consumption
    const formattedRecords = records.map((record) => ({
      id: record.id,
      childName: record.childName,
      fatherName: record.fatherName,
      motherName: record.motherName,
      birthDate: record.birthDate.toISOString(),
      birthPlace: record.birthPlace,
      baptismDate: record.baptismDate.toISOString(),
      priestName: record.priestName,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }));

    // Return success response with records - ONLY output JSON
    const response = {
      success: true,
      records: formattedRecords,
      count: formattedRecords.length,
    };

    // Output ONLY the JSON response, no other console.log statements
    console.log(JSON.stringify(response));
  } catch (error) {
    // Output error as JSON to stderr, not stdout
    const errorResponse = {
      success: false,
      error: error.message,
      records: [],
      count: 0,
    };

    // Output error JSON to stderr so it doesn't interfere with stdout JSON
    console.error(JSON.stringify(errorResponse));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getBaptismRecords();
