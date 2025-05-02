// src/app/api/address/create/route.ts
import { createAddress } from "@/app/lib/actions/address/address.controller";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

export const POST = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const decodeUser = await decrypt(authHeader);

    if (!decodeUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const createResult = await createAddress({
      user_id: decodeUser?.id,
      ward_id: body.ward_id,
      post_office_bn: body.post_office_bn,
      post_office_en: body.post_office_en,
      village_bn: body.village_bn,
      village_en: body.village_en,
    });

    return NextResponse.json(createResult, {
      status: createResult.status || 201,
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
