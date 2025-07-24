-- CreateTable
CREATE TABLE "ParishStaff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "role" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" INTEGER,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baptismRecordId" INTEGER,
    "parishStaffId" INTEGER,
    "auditedUserId" INTEGER,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_baptismRecordId_fkey" FOREIGN KEY ("baptismRecordId") REFERENCES "BaptismRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_parishStaffId_fkey" FOREIGN KEY ("parishStaffId") REFERENCES "ParishStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_auditedUserId_fkey" FOREIGN KEY ("auditedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BaptismRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "childName" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "birthDate" DATETIME NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "baptismDate" DATETIME NOT NULL,
    "priestName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" INTEGER NOT NULL,
    CONSTRAINT "BaptismRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BaptismRecord" ("baptismDate", "birthDate", "birthPlace", "childName", "createdAt", "createdBy", "fatherName", "id", "motherName", "priestName", "updatedAt") SELECT "baptismDate", "birthDate", "birthPlace", "childName", "createdAt", "createdBy", "fatherName", "id", "motherName", "priestName", "updatedAt" FROM "BaptismRecord";
DROP TABLE "BaptismRecord";
ALTER TABLE "new_BaptismRecord" RENAME TO "BaptismRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
