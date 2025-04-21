import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";

export async function POST(request: NextRequest) {
  const filesDirectory = path.join(process.cwd(), "files");

  try {
    await mkdir(filesDirectory, { recursive: true });
  } catch (error) {
    console.error("Error creating files directory:", error);
    return NextResponse.json({
      success: false,
      error: "Error creating files directory",
    });
  }

  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a new filename using the current timestamp
  const timestamp = Date.now();
  const fileName = file.name.split(" ").join("-").split(".").slice(0, -1)[0];

  const newFileName = `${fileName}-${timestamp}.webp`;
  const filePath = path.join(filesDirectory, newFileName);

  // Convert the image to WebP format using sharp
  const webpBuffer = await sharp(buffer)
    .webp({
      quality: 100,
    })
    .toBuffer();

  // Save the converted WebP image
  try {
    await writeFile(filePath, webpBuffer);
  } catch (error) {
    console.error("Error writing file:", error);
    return NextResponse.json({ success: false, error: "Error writing file" });
  }

  return NextResponse.json({
    success: true,
    title: fileName,
    fileName: newFileName,
    url: `/files/${newFileName}`,
  });
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
