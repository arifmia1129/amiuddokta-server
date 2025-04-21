import { NextRequest, NextResponse } from "next/server";
import { createApplicationController } from "@/app/lib/actions/application/application.controller";
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

    const data = await req.json();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Application information is required",
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const decodeUser = await decrypt(authHeader);

    const createApplicationRes = (await createApplicationController({
      ...data,
      user_id: decodeUser?.id,
    })) as any;

    const parsedResponse =
      typeof createApplicationRes === "string"
        ? JSON.parse(createApplicationRes)
        : createApplicationRes;

    return NextResponse.json(parsedResponse, {
      status: createApplicationRes.statusCode,
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
