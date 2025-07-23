const { PrismaClient } = require("./src/generated/prisma");

async function viewAllRecords() {
  const prisma = new PrismaClient();

  try {
    console.log("📋 Fetching all baptism records...\n");

    const records = await prisma.baptismRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (records.length === 0) {
      console.log("❌ No records found in the database.");
      return;
    }

    console.log(`✅ Found ${records.length} record(s):\n`);

    records.forEach((record, index) => {
      console.log(`--- Record #${index + 1} (ID: ${record.id}) ---`);
      console.log(`Child Name: ${record.childName}`);
      console.log(`Father: ${record.fatherName || "Not provided"}`);
      console.log(`Mother: ${record.motherName || "Not provided"}`);
      console.log(`Birth Date: ${record.birthDate.toDateString()}`);
      console.log(`Birth Place: ${record.birthPlace}`);
      console.log(`Baptism Date: ${record.baptismDate.toDateString()}`);
      console.log(`Priest: ${record.priestName}`);
      console.log(`Created By User ID: ${record.createdBy}`);
      console.log(`Created At: ${record.createdAt.toLocaleString()}`);
      console.log(`Updated At: ${record.updatedAt.toLocaleString()}`);
      console.log(""); // Empty line for separation
    });
  } catch (error) {
    console.error("❌ Error fetching records:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewAllRecords();
