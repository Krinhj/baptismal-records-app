// backupDatabase.js
const { PrismaClient } = require("../src/generated/prisma");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Encryption functions
const ENCRYPTION_KEY = "baptismal-records-backup-key-2024-32ch"; // Must be 32 characters for AES-256
const ALGORITHM = "aes-256-cbc";

function encryptData(text) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32); // Derive key
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptData(encryptedText) {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedData = textParts.join(":");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32); // Same key derivation
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function backupDatabase(backupPath, userId) {
  try {
    // Fetch business data only (exclude users for security)
    const [baptismRecords, parishStaff, auditLogs] = await Promise.all([
      prisma.baptismRecord.findMany({
        include: {
          creator: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
      }),
      prisma.parishStaff.findMany(),
      prisma.auditLog.findMany({
        include: {
          performer: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
      }),
    ]);

    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        version: "1.0",
        note: "User accounts excluded from backup for security",
        totalRecords: {
          baptismRecords: baptismRecords.length,
          parishStaff: parishStaff.length,
          auditLogs: auditLogs.length,
        },
      },
      data: {
        baptismRecords,
        parishStaff,
        auditLogs,
      },
    };

    // Encrypt and write backup file
    const jsonString = JSON.stringify(backupData, null, 2);
    const encryptedData = encryptData(jsonString);
    await fs.writeFile(backupPath, encryptedData, "utf8");

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "BACKUP",
        tableName: "DATABASE",
        recordId: null,
        oldValues: null,
        newValues: JSON.stringify({
          backupPath: path.basename(backupPath),
          recordCounts: backupData.metadata.totalRecords,
        }),
        notes: `Database backup created at ${backupPath} (users excluded)`,
      },
    });

    // Output only JSON for the frontend
    console.log(
      JSON.stringify({
        success: true,
        message:
          "Database backup completed successfully (users excluded for security)",
        recordCounts: backupData.metadata.totalRecords,
      })
    );
  } catch (error) {
    // Log the failed backup attempt
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId,
          action: "BACKUP_FAILED",
          tableName: "DATABASE",
          recordId: null,
          oldValues: null,
          newValues: JSON.stringify({ error: error.message }),
          notes: `Database backup failed: ${error.message}`,
        },
      });
    } catch (auditError) {
      // Silent fail for audit logging
    }

    // Output error as JSON
    console.log(
      JSON.stringify({
        success: false,
        error: error.message,
      })
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function and handle command line execution
if (require.main === module) {
  const [backupPath, userId] = process.argv.slice(2);
  backupDatabase(backupPath, parseInt(userId));
}

module.exports = { backupDatabase, decryptData };
