// src/app/api/agents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/app/lib/actions/user/user.controller";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    // Set role to "agent" to filter only agents
    const role = "agent";

    const params = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      status: status || undefined,
      role: role, // Filter by agent role
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const result = await getUsers(params);

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
