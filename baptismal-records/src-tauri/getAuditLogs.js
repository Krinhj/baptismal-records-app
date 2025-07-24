const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function getAuditLogs() {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        performer: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent logs first
      },
    });

    // ADD THIS: Output the data for Tauri to capture
    const response = {
      success: true,
      logs: auditLogs,
      count: auditLogs.length,
    };

    console.log(JSON.stringify(response));
    return auditLogs;
  } catch (error) {
    console.error("Error fetching audit logs:", error);

    // ADD THIS: Output error response for Tauri to capture
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

// Call the function immediately (remove the conditional)
getAuditLogs();
