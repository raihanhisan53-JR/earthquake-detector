-- CreateEnum
CREATE TYPE "Level" AS ENUM ('AMAN', 'WASPADA', 'BAHAYA');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('BMKG', 'USGS', 'ESP32', 'FALLBACK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "provider" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earthquake_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "Level" NOT NULL DEFAULT 'WASPADA',
    "magnitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'BMKG',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "detail" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "earthquake_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pga_cms2" DOUBLE PRECISION NOT NULL,
    "pga_peak" DOUBLE PRECISION NOT NULL,
    "alert_level" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AMAN',
    "sensor_ip" TEXT,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "earthquake_logs_timestamp_idx" ON "earthquake_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "earthquake_logs_source_idx" ON "earthquake_logs"("source");

-- CreateIndex
CREATE INDEX "earthquake_logs_level_idx" ON "earthquake_logs"("level");

-- CreateIndex
CREATE INDEX "sensor_readings_timestamp_idx" ON "sensor_readings"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "earthquake_logs" ADD CONSTRAINT "earthquake_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
