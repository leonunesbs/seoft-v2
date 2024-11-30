-- CreateEnum
CREATE TYPE "Role" AS ENUM ('I1', 'I2', 'I3', 'I4', 'R1', 'R2', 'R3', 'F1', 'F2', 'F3', 'STAFF');

-- CreateEnum
CREATE TYPE "EyeLogType" AS ENUM ('BIOMICROSCOPY', 'PACHYMETRY', 'TONOMETRY', 'OCT', 'VISUAL_FIELD', 'FUNDOSCOPY', 'RETINOGRAPHY', 'GONIOSCOPY', 'ANGIOGRAPHY', 'CT_CORNEA', 'OTHER_1', 'OTHER_2', 'OTHER_3');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicCollaborator" (
    "clinicId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicCollaborator_pkey" PRIMARY KEY ("clinicId","collaboratorId")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "clinicId" TEXT,
    "clinicalData" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "followUp" TEXT,
    "nextAppointment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eyes" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "rightEyeId" TEXT NOT NULL,
    "leftEyeId" TEXT NOT NULL,

    CONSTRAINT "Eyes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eye" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Eye_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EyeLog" (
    "id" TEXT NOT NULL,
    "type" "EyeLogType" NOT NULL,
    "eyeId" TEXT NOT NULL,
    "details" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EyeLog_pkey" PRIMARY KEY ("type","eyeId")
);

-- CreateTable
CREATE TABLE "Refraction" (
    "id" TEXT NOT NULL,
    "eyeId" TEXT NOT NULL,
    "spherical" DOUBLE PRECISION,
    "cylinder" DOUBLE PRECISION,
    "axis" DOUBLE PRECISION,
    "visualAcuity" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EyeSurgery" (
    "id" TEXT NOT NULL,
    "eyeId" TEXT NOT NULL,
    "procedure" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "EyeSurgery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eyedrop" (
    "id" TEXT NOT NULL,
    "eyeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "startDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Eyedrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_refId_key" ON "Patient"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_crm_key" ON "Collaborator"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "Eyes_evaluationId_key" ON "Eyes"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "Eyes_rightEyeId_key" ON "Eyes"("rightEyeId");

-- CreateIndex
CREATE UNIQUE INDEX "Eyes_leftEyeId_key" ON "Eyes"("leftEyeId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "ClinicCollaborator" ADD CONSTRAINT "ClinicCollaborator_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicCollaborator" ADD CONSTRAINT "ClinicCollaborator_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eyes" ADD CONSTRAINT "Eyes_rightEyeId_fkey" FOREIGN KEY ("rightEyeId") REFERENCES "Eye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eyes" ADD CONSTRAINT "Eyes_leftEyeId_fkey" FOREIGN KEY ("leftEyeId") REFERENCES "Eye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eyes" ADD CONSTRAINT "Eyes_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EyeLog" ADD CONSTRAINT "EyeLog_eyeId_fkey" FOREIGN KEY ("eyeId") REFERENCES "Eye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refraction" ADD CONSTRAINT "Refraction_eyeId_fkey" FOREIGN KEY ("eyeId") REFERENCES "Eye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EyeSurgery" ADD CONSTRAINT "EyeSurgery_eyeId_fkey" FOREIGN KEY ("eyeId") REFERENCES "Eye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eyedrop" ADD CONSTRAINT "Eyedrop_eyeId_fkey" FOREIGN KEY ("eyeId") REFERENCES "Eye"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
