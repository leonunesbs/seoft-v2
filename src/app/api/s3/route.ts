import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Inicializa o cliente S3
const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

// Função para gerar URL pré-assinada para upload
async function generateUploadUrl(
  fileName: string,
  contentType: string,
  bucketName: string,
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: contentType || "application/octet-stream",
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const objectUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

  return { signedUrl, objectUrl };
}

// Função para gerar URL pré-assinada para download
async function generateDownloadUrl(fileName: string, bucketName: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Função para listar arquivos no bucket
async function listFiles(bucketName: string) {
  const command = new ListObjectsV2Command({ Bucket: bucketName });
  const response = await s3Client.send(command);
  return response.Contents ?? [];
}

// Função para excluir arquivo no bucket
async function deleteFile(fileName: string, bucketName: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });
  await s3Client.send(command);
  return { success: true, fileName };
}

// Handler principal da API
export async function GET(request: NextRequest) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    return new Response("Bucket name is missing.", { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");

  if (!action) {
    return new Response("Missing action parameter.", { status: 400 });
  }

  try {
    switch (action) {
      case "upload":
        if (!fileName || !contentType) {
          return new Response("Missing fileName or contentType for upload.", {
            status: 400,
          });
        }
        const uploadResponse = await generateUploadUrl(
          fileName,
          contentType,
          bucketName,
        );
        return NextResponse.json(uploadResponse);

      case "download":
        if (!fileName) {
          return new Response("Missing fileName for download.", {
            status: 400,
          });
        }
        const downloadUrl = await generateDownloadUrl(fileName, bucketName);
        return NextResponse.json({ downloadUrl });

      case "list":
        const files = await listFiles(bucketName);
        return NextResponse.json({ files });

      case "delete":
        if (!fileName) {
          return new Response("Missing fileName for deletion.", {
            status: 400,
          });
        }
        const deleteResponse = await deleteFile(fileName, bucketName);
        return NextResponse.json(deleteResponse);

      default:
        return new Response("Invalid action parameter.", { status: 400 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal Server Error.", { status: 500 });
  }
}
