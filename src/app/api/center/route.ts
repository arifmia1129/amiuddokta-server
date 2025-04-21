import {
  getAllCenters,
  getCenterById,
  searchCenters,
} from "@/app/lib/actions/center/center.controller";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const center_type = searchParams.get("center_type");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    // If ID is provided, retrieve specific center
    if (id) {
      const retrieveResult = await getCenterById({ id });

      return NextResponse.json(retrieveResult, {
        status: retrieveResult.status || 200,
      });
    }

    // Retrieve list of centers with search and pagination
    const centerParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      division: division || undefined,
      district: district || undefined,
      center_type: center_type || undefined,
    };

    const listResult = await searchCenters(centerParams);

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
