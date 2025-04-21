import { NextRequest, NextResponse } from "next/server";
import {
  getServiceCategories,
  getServiceCategoryById,
  getServiceCategoryBySlug,
} from "@/app/lib/actions/serviceCategory/serviceCategory.controller";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const search = searchParams.get("search");
    const isActive = searchParams.get("is_active");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    // If ID is provided, retrieve specific service category
    if (id) {
      const retrieveResult = await getServiceCategoryById({ id });

      return NextResponse.json(retrieveResult, {
        status: retrieveResult.status || 200,
      });
    }
    if (slug) {
      const retrieveResult = await getServiceCategoryBySlug({ slug });

      return NextResponse.json(retrieveResult, {
        status: retrieveResult.status || 200,
      });
    }

    // Retrieve list of service categories
    const serviceCategoryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      is_active: isActive ? isActive === "true" : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const listResult = await getServiceCategories(serviceCategoryParams);

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
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
