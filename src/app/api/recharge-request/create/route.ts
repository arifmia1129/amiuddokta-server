import { createRechargeRequestController } from "@/app/lib/actions/recharge-request/recharge-request.controller";
import { NextRequest, NextResponse } from "next/server";

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
          message: "Recharge information is required",
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const createRechargeRes = (await createRechargeRequestController({
      ...data,
      token: authHeader,
    })) as any;

    const parsedResponse =
      typeof createRechargeRes === "string"
        ? JSON.parse(createRechargeRes)
        : createRechargeRes;

    return NextResponse.json(parsedResponse, {
      status: createRechargeRes.statusCode,
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
