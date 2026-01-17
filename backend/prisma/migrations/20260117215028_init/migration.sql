-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "githubRepoId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cloneUrl" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL,
    "webhookId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Repository" ("cloneUrl", "createdAt", "defaultBranch", "fullName", "githubRepoId", "id", "name", "userId", "webhookId") SELECT "cloneUrl", "createdAt", "defaultBranch", "fullName", "githubRepoId", "id", "name", "userId", "webhookId" FROM "Repository";
DROP TABLE "Repository";
ALTER TABLE "new_Repository" RENAME TO "Repository";
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
