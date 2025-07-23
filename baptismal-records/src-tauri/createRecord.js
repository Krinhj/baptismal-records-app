const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function createBaptismRecord() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 8) {
      throw new Error(
        "Invalid number of arguments. Expected: childName, fatherName, motherName, birthDate, birthPlace, baptismDate, priestName, createdBy"
      );
    }

    const [
      childName,
      fatherName,
      motherName,
      birthDate,
      birthPlace,
      baptismDate,
      priestName,
      createdBy,
    ] = args;

    // Parse dates
    const parsedBirthDate = new Date(birthDate);
    const parsedBaptismDate = new Date(baptismDate);
    const parsedCreatedBy = parseInt(createdBy);

    // Validate dates
    if (isNaN(parsedBirthDate.getTime())) {
      throw new Error("Invalid birth date format");
    }

    if (isNaN(parsedBaptismDate.getTime())) {
      throw new Error("Invalid baptism date format");
    }

    if (parsedBaptismDate < parsedBirthDate) {
      throw new Error("Baptism date cannot be before birth date");
    }

    // Validate that at least one parent is provided
    if (!fatherName && !motherName) {
      throw new Error("At least one parent name is required");
    }

    // Create the record
    const newRecord = await prisma.baptismRecord.create({
      data: {
        childName: childName.trim(),
        fatherName:
          fatherName && fatherName.trim() !== "" ? fatherName.trim() : null,
        motherName:
          motherName && motherName.trim() !== "" ? motherName.trim() : null,
        birthDate: parsedBirthDate,
        birthPlace: birthPlace.trim(),
        baptismDate: parsedBaptismDate,
        priestName: priestName.trim(),
        createdBy: parsedCreatedBy,
      },
    });

    // Return success response with the created record
    const response = {
      success: true,
      record: {
        id: newRecord.id,
        childName: newRecord.childName,
        fatherName: newRecord.fatherName,
        motherName: newRecord.motherName,
        birthDate: newRecord.birthDate.toISOString(),
        birthPlace: newRecord.birthPlace,
        baptismDate: newRecord.baptismDate.toISOString(),
        priestName: newRecord.priestName,
        createdAt: newRecord.createdAt.toISOString(),
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

createBaptismRecord();
