/*
  Warnings:

  - You are about to drop the column `fullName` on the `BaptismRecord` table. All the data in the column will be lost.
  - You are about to drop the column `parents` on the `BaptismRecord` table. All the data in the column will be lost.
  - You are about to drop the column `priest` on the `BaptismRecord` table. All the data in the column will be lost.
  - Added the required column `birthPlace` to the `BaptismRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childName` to the `BaptismRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `BaptismRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priestName` to the `BaptismRecord` table without a default value. This is not possible if the table is not empty.

*/
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
    "createdBy" INTEGER NOT NULL
);
INSERT INTO "new_BaptismRecord" ("baptismDate", "birthDate", "createdAt", "id", "updatedAt") SELECT "baptismDate", "birthDate", "createdAt", "id", "updatedAt" FROM "BaptismRecord";
DROP TABLE "BaptismRecord";
ALTER TABLE "new_BaptismRecord" RENAME TO "BaptismRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
