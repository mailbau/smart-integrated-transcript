-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "excelFile" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "transcriptKey" TEXT,
ADD COLUMN     "transcriptUrl" TEXT;
