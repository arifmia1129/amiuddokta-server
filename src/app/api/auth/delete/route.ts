import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { createUserController } from "@/app/lib/actions/user-bk/user.controller";
import { deleteUserByIdController } from "@/app/lib/actions/user-bk/user.controller"; // Assuming you have this controller
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const { userId } = await req.json(); // Assuming the user ID to be deleted is sent in the request body

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required to delete the user" },
        { status: 400 },
      );
    }

    // Call the deleteUserByIdController to delete the user by their ID
    const response = await deleteUserByIdController(userId);

    return NextResponse.json(
      typeof response === "string" ? JSON.parse(response) : response,
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
};

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
