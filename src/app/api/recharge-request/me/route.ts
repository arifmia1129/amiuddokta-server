// src/app/api/auth/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { retrieveUserByIdController } from "@/app/lib/actions/user-bk/user.controller";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { retrieveRechargeRequestListByUserIdController } from "@/app/lib/actions/recharge-request/recharge-request.controller";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const decodeUser = await decrypt(authHeader);

    const pagination: any = {
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
    } as any;

    const statements = await retrieveRechargeRequestListByUserIdController(
      decodeUser.id,
      pagination,
    );

    return NextResponse.json(statements, {
      status: statements.statusCode,
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
