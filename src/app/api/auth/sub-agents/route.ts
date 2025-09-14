import { NextRequest, NextResponse } from "next/server";
import { retrieveSubAgentsByAgentIdController } from "@/app/lib/actions/user/user.controller";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid" },
        { status: 401 },
      );
    }

    const decodeUser = await decrypt(authHeader);

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;

    const response = await retrieveSubAgentsByAgentIdController({
      page,
      limit: pageSize,
    });
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};
