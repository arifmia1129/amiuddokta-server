// src/app/api/public-services/route.ts

import {
  getPublicServices,
  getPublicServiceById,
} from "@/app/lib/actions/publicService/publicService.controller";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    if (id) {
      const result = await getPublicServiceById({ id });
      return NextResponse.json(result, {
        status: result.status || 200,
      });
    }

    const queryParams = {
      search: search || undefined,
      category: category as
        | "new_services"
        | "notices"
        | "important_links"
        | undefined,
      status: status as "active" | "inactive" | undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const result = await getPublicServices(queryParams);

    return NextResponse.json(result, {
      status: result.status || 200,
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
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
