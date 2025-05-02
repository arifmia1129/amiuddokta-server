import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import { deleteAddress } from "@/app/lib/actions/address/address.controller";

export const DELETE = async (req: NextRequest) => {
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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Address ID is required" },
        { status: 400 },
      );
    }

    const deleteResult = await deleteAddress({ id });

    return NextResponse.json(deleteResult, {
      status: deleteResult.status || 200,
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
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
