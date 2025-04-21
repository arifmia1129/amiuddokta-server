// src/app/api/blog-categories/slug/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getBlogCategoryBySlug } from "@/app/lib/actions/blogCategory/blogCategory.controller";

export const GET = async (
  req: NextRequest,
  { params }: { params: { slug: string } },
) => {
  try {
    const { slug } = params;

    const result = await getBlogCategoryBySlug({ slug });

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
