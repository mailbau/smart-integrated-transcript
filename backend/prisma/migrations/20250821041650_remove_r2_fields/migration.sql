/*
  Warnings:

  - You are about to drop the column `fileSize` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptKey` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptUrl` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "fileSize",
DROP COLUMN "transcriptKey",
DROP COLUMN "transcriptUrl";
