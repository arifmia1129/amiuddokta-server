"use server";

import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import {
  getEntrepreneurProfileService,
  updateEntrepreneurProfileService,
  updateEntrepreneurPinService,
  updateEntrepreneurProfileImageService,
  EntrepreneurProfileUpdateData,
  PinUpdateData,
} from "./entrepreneur.service";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

export const getEntrepreneurProfileController = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 }
      );
    }

    const result = await getEntrepreneurProfileService(Number(decodeUser.id));
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in getEntrepreneurProfileController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const updateEntrepreneurProfileController = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 }
      );
    }

    const updateData: EntrepreneurProfileUpdateData = await request.json();
    const result = await updateEntrepreneurProfileService(
      Number(decodeUser.id),
      updateData
    );

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in updateEntrepreneurProfileController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const updateEntrepreneurPinController = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 }
      );
    }

    const pinData: PinUpdateData = await request.json();
    const result = await updateEntrepreneurPinService(
      Number(decodeUser.id),
      pinData
    );

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in updateEntrepreneurPinController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const updateEntrepreneurProfileImageController = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("profileImage") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No image file provided",
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        },
        { status: 400 }
      );
    }

    // Create files directory if it doesn't exist (same as main upload system)
    const filesDir = join(process.cwd(), "files");
    if (!existsSync(filesDir)) {
      await mkdir(filesDir, { recursive: true });
    }

    // Generate unique filename in WebP format (same as main upload system)
    const timestamp = Date.now();
    const fileName = file.name.split(" ").join("-").split(".").slice(0, -1)[0] || "profile";
    const filename = `${fileName}-${decodeUser.id}-${timestamp}.webp`;
    const filepath = join(filesDir, filename);

    // Convert file to buffer and convert to WebP
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert the image to WebP format using sharp (same as main upload system)
    const webpBuffer = await sharp(buffer)
      .webp({
        quality: 85, // Slightly lower quality for profile images to save space
      })
      .resize(400, 400, { // Resize to reasonable size for profile images
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // Save the converted WebP image
    await writeFile(filepath, webpBuffer);

    // Update profile image in database - store the relative path from files directory
    const profileImagePath = `/files/${filename}`;
    const result = await updateEntrepreneurProfileImageService(
      Number(decodeUser.id),
      profileImagePath
    );

    if (!result.success) {
      return NextResponse.json(result, { status: result.statusCode });
    }

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        profileImage: profileImagePath,
      },
    });
  } catch (error) {
    console.error("Error in updateEntrepreneurProfileImageController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};