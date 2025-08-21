-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "underReviewAt" TIMESTAMP(3);
