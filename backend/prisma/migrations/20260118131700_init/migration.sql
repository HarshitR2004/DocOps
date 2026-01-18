/*
  Warnings:

  - You are about to drop the column `containerId` on the `Deployment` table. All the data in the column will be lost.
  - You are about to drop the column `exposedPort` on the `Deployment` table. All the data in the column will be lost.
  - You are about to drop the column `deploymentId` on the `Container` table. All the data in the column will be lost.
  - Added the required column `repositoryId` to the `Container` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageTag" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deployment_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Deployment" ("branch", "commitSha", "createdAt", "id", "imageTag", "repositoryId", "status", "updatedAt") SELECT "branch", "commitSha", "createdAt", "id", "imageTag", "repositoryId", "status", "updatedAt" FROM "Deployment";
DROP TABLE "Deployment";
ALTER TABLE "new_Deployment" RENAME TO "Deployment";
CREATE INDEX "Deployment_repositoryId_idx" ON "Deployment"("repositoryId");
CREATE TABLE "new_Container" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "dockerContainerId" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "stoppedAt" DATETIME,
    CONSTRAINT "Container_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Container" ("dockerContainerId", "id", "port", "startedAt", "status", "stoppedAt") SELECT "dockerContainerId", "id", "port", "startedAt", "status", "stoppedAt" FROM "Container";
DROP TABLE "Container";
ALTER TABLE "new_Container" RENAME TO "Container";
CREATE UNIQUE INDEX "Container_repositoryId_key" ON "Container"("repositoryId");
CREATE INDEX "Container_repositoryId_idx" ON "Container"("repositoryId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
