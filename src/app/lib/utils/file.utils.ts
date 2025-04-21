// src/app/lib/utils/file.utils.ts
"use server";

import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

// Define allowed file types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/jpg",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Function to validate file
export function validateFile(
  file: File,
  allowedTypes = ALLOWED_IMAGE_TYPES,
  maxSize = MAX_FILE_SIZE,
) {
  if (!file) {
    return { valid: false, message: "No file provided" };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File type must be one of: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true, message: "File is valid" };
}

// Function to save file to disk
export async function saveFile(file: File, directory = "uploads") {
  try {
    // Create directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", directory);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename while preserving extension
    const fileExt = path.extname(file.name);
    const baseName = path.basename(file.name, fileExt);
    const sanitizedBaseName = baseName
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    const fileName = `${sanitizedBaseName}-${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer as any);

    return {
      file_name: fileName,
      original_name: file.name,
      file_path: `/${directory}/${fileName}`, // Path relative to public directory
      file_type: fileExt.slice(1),
      mime_type: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save file");
  }
}

// Function to delete file from disk
export async function deleteFile(filePath: string) {
  try {
    // Ensure path starts from public directory
    const fullPath = path.join(
      process.cwd(),
      "public",
      filePath.replace(/^\//, ""),
    );

    // Check if file exists
    if (!existsSync(fullPath)) {
      return { success: false, message: "File not found" };
    }

    // Delete file
    await unlink(fullPath);

    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
}
