
import { NextRequest, NextResponse } from "next/server";
import { getBlogCategories } from "@/app/lib/actions/blogCategory/blogCategory.controller";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const isActive = searchParams.get("is_active");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    const params = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      is_active: isActive ? isActive === "true" : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const result = await getBlogCategories(params);

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
