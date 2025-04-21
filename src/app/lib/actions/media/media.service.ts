// src/app/lib/actions/media/media.service.ts
"use server";

import { db } from "@/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import {
  CreateMediaServerInput,
  UpdateMediaInput,
  MediaFilterInput,
} from "./media.validation";
import {
  createSearchCondition,
  buildPaginationMeta,
} from "@/app/lib/utils/pagination.utils";
import { media } from "@/db/schema/media";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUserSession } from "../../utils/auth.utils";

// Helper function to save a file to disk
async function saveFileToDisk(file: File): Promise<{
  file_name: string;
  file_path: string;
  file_type: string;
  mime_type: string;
  size: number;
}> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileName = `${uuidv4()}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer as any);

    // Extract file extension
    const fileExt = path.extname(file.name).slice(1);

    return {
      file_name: fileName,
      file_path: `/uploads/${fileName}`, // Path relative to public directory
      file_type: fileExt,
      mime_type: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save file");
  }
}

// Get media items with filtering
export async function getMediaService(options: MediaFilterInput) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    file_type,
    sortBy = "created_at",
    sortOrder = "desc",
    user_id,
  } = options;

  // Build search conditions
  const searchCondition = search
    ? createSearchCondition(search, [
        "title",
        "alt_text",
        "description",
        "file_name",
      ])
    : sql`1=1`;

  // Build status condition
  const statusCondition = status ? sql`status = ${status}` : sql`1=1`;

  // Build file type condition
  const fileTypeCondition = file_type
    ? sql`file_type = ${file_type}`
    : sql`1=1`;

  // Build user condition
  const userCondition = user_id ? sql`user_id = ${user_id}` : sql`1=1`;

  // Combine all conditions
  const whereCondition = and(
    searchCondition,
    statusCondition,
    fileTypeCondition,
    userCondition,
  );

  // Count total records
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(whereCondition);

  const total = countResult[0].count;

  // Get paginated results
  const offset = (page - 1) * limit;

  // Create a type-safe mapping for valid sort columns
  const sortableColumns = {
    id: media.id,
    title: media.title,
    file_name: media.file_name,
    size: media.size,
    status: media.status,
    created_at: media.created_at,
    updated_at: media.updated_at,
  };

  // Safely access the sort column with a fallback to created_at
  const sortColumn =
    sortableColumns[sortBy as keyof typeof sortableColumns] || media.created_at;

  // Apply the sort direction
  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  const result = await db
    .select()
    .from(media)
    .where(whereCondition)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: result,
    meta: buildPaginationMeta(total, { page, limit }),
  };
}

// Get single media by ID
export async function getMediaByIdService(id: number) {
  const result = await db.select().from(media).where(eq(media.id, id)).limit(1);

  return result[0] || null;
}

// Create new media
export async function createMediaService(mediaData: CreateMediaServerInput) {
  const session = await getCurrentUserSession();
  if (!session) {
    return {
      success: false,
      message: "Authentication required",
      status: 401,
    };
  }

  // Insert media
  const result = await db
    .insert(media)
    .values({
      ...mediaData,
      user_id: session.id,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  return result[0];
}

// Update existing media
export async function updateMediaService(
  id: number,
  mediaData: UpdateMediaInput,
) {
  const updates = {
    ...mediaData,
    updated_at: new Date(),
  };

  // Update media
  const result = await db
    .update(media)
    .set(updates)
    .where(eq(media.id, id))
    .returning();

  return result[0] || null;
}

// Delete media
export async function deleteMediaService(id: number) {
  // Note: In a real-world application, you would also delete the file from disk here
  await db.delete(media).where(eq(media.id, id));
  return true;
}

// Upload file and create media record
export async function uploadFileService(
  file: File,
  userData: Omit<
    CreateMediaServerInput,
    "file_name" | "file_path" | "file_type" | "mime_type" | "size"
  >,
) {
  // Save file to disk
  const fileData = await saveFileToDisk(file);

  // Create media record
  const result = await createMediaService({
    ...userData,
    ...fileData,
  });

  return result;
}
