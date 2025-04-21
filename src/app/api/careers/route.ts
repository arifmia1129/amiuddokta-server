import { NextRequest, NextResponse } from "next/server";
import {
  getCareersItems,
  getCareersItemById,
} from "@/app/lib/actions/careers/careers.controller";
import { ZodError } from "zod";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const isFeatured = searchParams.get("is_featured");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const jobType = searchParams.get("job_type");
    const jobStatus = searchParams.get("job_status");

    // If ID is provided, retrieve specific career item
    if (id) {
      const retrieveResult = await getCareersItemById({ id });
      return NextResponse.json(retrieveResult, {
        status: retrieveResult.status || 200,
      });
    }

    // Retrieve list of career items with filters
    const listResult = await getCareersItems({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      is_featured: isFeatured ? isFeatured === "true" : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
      job_type: jobType as
        | "full_time"
        | "part_time"
        | "contract"
        | "freelance"
        | "internship"
        | "remote"
        | undefined,
      job_status: jobStatus as
        | "open"
        | "closed"
        | "draft"
        | "expired"
        | "filled"
        | undefined,
    });

    return NextResponse.json(listResult, {
      status: listResult.status || 200,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        ...(error instanceof ZodError ? { errors: error.format() } : {}),
      },
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
