// src/app/api/agent/profile/route.ts
import { updateUser } from "@/app/lib/actions/user/user.controller";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { base64Uploader } from "@/utils/base64Uploader";

export const PUT = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const profile_image = await base64Uploader(body?.profile_image);

    body.profile_image = profile_image?.fileName;

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const decodeUser = await decrypt(authHeader);

    const updateResult = await updateUser({
      id: decodeUser.id,
      data: body,
    });

    return NextResponse.json(updateResult, {
      status: updateResult.status || 200,
    });
  } catch (error: any) {
    console.log(error);
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
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
