// src/app/api/address/route.ts
import {
  getAddresses,
  getAddressById,
} from "@/app/lib/actions/address/address.controller";
import { NextRequest, NextResponse } from "next/server";
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

    if (!decodeUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const ward_id = searchParams.get("ward_id");
    const user_id = searchParams.get("user_id");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    // If ID is provided, retrieve specific address
    if (id) {
      const retrieveResult = await getAddressById({ id });

      return NextResponse.json(retrieveResult, {
        status: retrieveResult.status || 200,
      });
    }

    // Retrieve list of addresses with filters and pagination
    const addressParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      ward_id: ward_id ? parseInt(ward_id, 10) : undefined,
      user_id: user_id ? parseInt(user_id, 10) : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const listResult = await getAddresses(addressParams);

    return NextResponse.json(listResult, {
      status: listResult.status || 200,
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
