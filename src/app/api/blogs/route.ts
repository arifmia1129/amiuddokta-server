import { getBlogPosts } from "@/app/lib/actions/blogPosts/blogPosts.controller";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const isPublished = searchParams.get("is_published");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const categoryId = searchParams.get("categoryId");

    const params = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      is_published: isPublished ? isPublished === "true" : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
      category_id: categoryId ? parseInt(categoryId, 10) : undefined,
    };

    console.log(params);

    const result = await getBlogPosts(params);

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
