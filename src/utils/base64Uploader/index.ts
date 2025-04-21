import { writeFile, mkdir } from "fs/promises";
import sharp from "sharp";
import path from "path";
import crypto from "crypto";

/**
 * Uploads a base64 image, converts it to WebP format, and saves it to the filesystem with a random filename
 * @param base64Image - The base64 encoded image data (with or without data URL prefix)
 * @returns Object containing upload results
 */
export async function base64Uploader(base64Image: string): Promise<{
  success: boolean;
  fileName?: string;
  url?: string;
  error?: string;
}> {
  const outputDirectory = path.join(process.cwd(), "files");

  try {
    // Create directory if it doesn't exist
    await mkdir(outputDirectory, { recursive: true });

    // Validate input
    if (!base64Image) {
      return {
        success: false,
        error: "Missing base64Image",
      };
    }

    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.includes("base64,")
      ? base64Image.split("base64,")[1]
      : base64Image;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Generate a random filename
    const randomString = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const newFileName = `image-${randomString}-${timestamp}.webp`;
    const filePath = path.join(outputDirectory, newFileName);

    // Convert the image to WebP format using sharp
    const webpBuffer = await sharp(buffer)
      .webp({
        quality: 100,
      })
      .toBuffer();

    // Save the converted WebP image
    await writeFile(filePath, webpBuffer);

    return {
      success: true,
      fileName: newFileName,
      url: `/files/${newFileName}`,
    };
  } catch (error) {
    console.error("Error in base64Uploader:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
