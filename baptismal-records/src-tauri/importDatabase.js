// importDatabase.js
const { PrismaClient } = require("../src/generated/prisma");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Encryption functions (must match backupDatabase.js)
const ENCRYPTION_KEY = "baptismal-records-backup-key-2024-32ch"; // Same key as backup
const ALGORITHM = "aes-256-cbc";

function decryptData(encryptedText) {
  try {
    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedData = textParts.join(":");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32); // Same key derivation
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new Error("Invalid backup file or incorrect encryption key");
  }
}

async function importDatabase(backupPath, userId) {
  try {
    // Read and decrypt backup file
    const encryptedContent = await fs.readFile(backupPath, "utf8");

    // Try to decrypt - if it fails, might be an old unencrypted backup
    let backupContent;
    try {
      backupContent = decryptData(encryptedContent);
    } catch (decryptError) {
      // Try parsing as plain JSON (backward compatibility)
      try {
        JSON.parse(encryptedContent);
        backupContent = encryptedContent;
        console.log("⚠️ WARNING: Importing unencrypted backup file");
      } catch (jsonError) {
        throw new Error(
          "Invalid backup file format - not encrypted or valid JSON"
        );
      }
    }

    const backupData = JSON.parse(backupContent);

    // Validate backup file structure
    if (!backupData.metadata || !backupData.data) {
      throw new Error("Invalid backup file format - missing metadata or data");
    }

    const { baptismRecords, parishStaff, users, auditLogs } = backupData.data;

    // Use transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // Clear existing business data only (preserve users for security)
      await tx.auditLog.deleteMany();
      await tx.baptismRecord.deleteMany();
      await tx.parishStaff.deleteMany();
      // NOTE: Users table is NOT cleared to preserve authentication

      // Reset auto-increment sequences for business tables only
      await tx.$executeRaw`DELETE FROM sqlite_sequence WHERE name IN ('BaptismRecord', 'ParishStaff', 'AuditLog')`;

      // Skip importing users (preserve existing user accounts)
      // This prevents login issues and maintains security

      // Import parish staff
      if (parishStaff && parishStaff.length > 0) {
        for (const staff of parishStaff) {
          await tx.parishStaff.create({
            data: {
              id: staff.id,
              name: staff.name,
              title: staff.title,
              role: staff.role,
              active: staff.active,
              createdAt: new Date(staff.createdAt),
              updatedAt: new Date(staff.updatedAt),
            },
          });
        }
      }

      // Import baptism records
      if (baptismRecords && baptismRecords.length > 0) {
        for (const record of baptismRecords) {
          await tx.baptismRecord.create({
            data: {
              id: record.id,
              childName: record.childName,
              fatherName: record.fatherName,
              motherName: record.motherName,
              birthDate: new Date(record.birthDate),
              birthPlace: record.birthPlace,
              baptismDate: new Date(record.baptismDate),
              priestName: record.priestName,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt),
              createdBy: record.createdBy,
            },
          });
        }
      }

      // Import audit logs last
      if (auditLogs && auditLogs.length > 0) {
        for (const log of auditLogs) {
          await tx.auditLog.create({
            data: {
              id: log.id,
              userId: log.userId,
              action: log.action,
              tableName: log.tableName,
              recordId: log.recordId,
              oldValues: log.oldValues,
              newValues: log.newValues,
              ipAddress: log.ipAddress,
              userAgent: log.userAgent,
              notes: log.notes,
              createdAt: new Date(log.createdAt),
              baptismRecordId: log.baptismRecordId,
              parishStaffId: log.parishStaffId,
              auditedUserId: log.auditedUserId,
            },
          });
        }
      }
    });

    // Create audit log for successful import
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "IMPORT",
        tableName: "DATABASE",
        recordId: null,
        oldValues: null,
        newValues: JSON.stringify({
          backupFile: path.basename(backupPath),
          importedCounts: {
            baptismRecords: baptismRecords?.length || 0,
            parishStaff: parishStaff?.length || 0,
            auditLogs: auditLogs?.length || 0,
            usersPreserved: true,
          },
        }),
        notes: `Database imported from encrypted backup: ${path.basename(
          backupPath
        )} (user accounts preserved)`,
      },
    });

    console.log(
      JSON.stringify({
        success: true,
        message:
          "Database import completed successfully (user accounts preserved)",
        importedCounts: {
          baptismRecords: baptismRecords?.length || 0,
          parishStaff: parishStaff?.length || 0,
          auditLogs: auditLogs?.length || 0,
          usersPreserved: true,
        },
      })
    );
  } catch (error) {
    // Log the failed import attempt
    try {
      await prisma.auditLog.create({
        data: {
          userId: userId,
          action: "IMPORT_FAILED",
          tableName: "DATABASE",
          recordId: null,
          oldValues: null,
          newValues: JSON.stringify({ error: error.message }),
          notes: `Database import failed: ${error.message}`,
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
  importDatabase(backupPath, parseInt(userId));
}

module.exports = { importDatabase };
