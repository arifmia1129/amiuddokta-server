// src/app/api/auth/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateUserByIdController } from "@/app/lib/actions/user-bk/user.controller";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

export const PATCH = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    const data = await req.json();
    const url = new URL(req.url);
    const subAgentId = Number(url.searchParams.get("subAgentId"));

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const decodeUser = await decrypt(authHeader);

    // You can use decodedToken to access user information if needed
    const updateProfileResult = await updateUserByIdController({
      id: subAgentId ? subAgentId : decodeUser.id,
      ...data,
    });

    return NextResponse.json(updateProfileResult, {
      status: updateProfileResult.statusCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
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
