/*
  Warnings:

  - You are about to drop the column `repositoryId` on the `Container` table. All the data in the column will be lost.
  - Added the required column `deploymentId` to the `Container` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN "containerId" TEXT;
ALTER TABLE "Deployment" ADD COLUMN "exposedPort" INTEGER;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Container" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deploymentId" TEXT NOT NULL,
    "dockerContainerId" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "stoppedAt" DATETIME,
    CONSTRAINT "Container_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Container" ("dockerContainerId", "id", "port", "startedAt", "status", "stoppedAt") SELECT "dockerContainerId", "id", "port", "startedAt", "status", "stoppedAt" FROM "Container";
DROP TABLE "Container";
ALTER TABLE "new_Container" RENAME TO "Container";
CREATE UNIQUE INDEX "Container_deploymentId_key" ON "Container"("deploymentId");
CREATE INDEX "Container_deploymentId_idx" ON "Container"("deploymentId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
