import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fileName = request.url.split("?")[1]?.split("=")[1];

  if (!fileName) {
    return new Response(
      JSON.stringify({ success: false, error: "File name is required" }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const path = `./files/${fileName}`;
    const fileData = await readFile(path);
    const buffer = Buffer.from(fileData);

    // Determine the content type based on file extension or use a default content type
    let contentType = "application/octet-stream"; // default content type
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (fileName.endsWith(".png")) {
      contentType = "image/png";
    } else if (fileName.endsWith(".pdf")) {
      contentType = "application/pdf";
    } // Add more content types as needed

    return new Response(buffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Error retrieving file:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "File not found or could not be read",
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }
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
