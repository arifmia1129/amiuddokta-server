import {
  getTeamMembers,
  getTeamMemberById,
} from "@/app/lib/actions/team/team.controller";
import { NextRequest, NextResponse } from "next/server";

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

    // If ID is provided, retrieve specific team member
    if (id) {
      const retrieveResult = await getTeamMemberById({ id });

      return NextResponse.json(retrieveResult, {
        status: retrieveResult.status || 200,
      });
    }

    // Retrieve list of team members
    const teamParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search: search || undefined,
      is_featured: isFeatured ? isFeatured === "true" : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const listResult = await getTeamMembers(teamParams);

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
