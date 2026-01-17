-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageTag" TEXT,
    "containerId" TEXT,
    "exposedPort" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deployment_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Deployment" ("branch", "commitSha", "containerId", "createdAt", "exposedPort", "id", "imageTag", "repositoryId", "status", "updatedAt") SELECT "branch", "commitSha", "containerId", "createdAt", "exposedPort", "id", "imageTag", "repositoryId", "status", "updatedAt" FROM "Deployment";
DROP TABLE "Deployment";
ALTER TABLE "new_Deployment" RENAME TO "Deployment";
CREATE INDEX "Deployment_repositoryId_idx" ON "Deployment"("repositoryId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
