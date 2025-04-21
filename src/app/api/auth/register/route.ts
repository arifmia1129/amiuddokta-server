import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { createUserController } from "@/app/lib/actions/user-bk/user.controller";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const requestData = await req.json();

    // Add the token to the request data for authorization and parent ID resolution.
    const response = await createUserController({
      ...requestData,
    });

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
