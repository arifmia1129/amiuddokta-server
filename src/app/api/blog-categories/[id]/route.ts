
import { NextRequest, NextResponse } from "next/server";
import { getBlogCategoryById } from "@/app/lib/actions/blogCategory/blogCategory.controller";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    const result = await getBlogCategoryById({ id });

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
