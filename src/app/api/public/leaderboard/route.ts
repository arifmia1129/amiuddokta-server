// src/app/api/public/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { bdrisApplications } from "@/db/schema/applications";
import { sql, desc, eq, and, count } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    // Build date filter for applications
    let dateCondition = sql`1=1`;
    if (month && year) {
      // Filter applications for specific month and year
      dateCondition = sql`EXTRACT(MONTH FROM ${bdrisApplications.submittedAt}) = ${month} AND EXTRACT(YEAR FROM ${bdrisApplications.submittedAt}) = ${year}`;
    }

    // Query to get top users by application count
    const topUsersQuery = await db
      .select({
        id: users.id,
        name: users.name,
        center_name: users.center_name,
        center_address: users.center_address,
        profile_image: users.profile_image,
        application_count: count(bdrisApplications.id),
      })
      .from(users)
      .leftJoin(bdrisApplications, eq(users.id, bdrisApplications.userId))
      .where(dateCondition)
      .groupBy(users.id, users.name, users.center_name, users.center_address, users.profile_image)
      .having(sql`COUNT(${bdrisApplications.id}) > 0`)
      .orderBy(desc(count(bdrisApplications.id)))
      .limit(limit);

    const response = {
      success: true,
      message: "Top users retrieved successfully",
      data: topUsersQuery,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to retrieve top users",
        error: error.message 
      },
      { status: 500 }
    );
  }
};

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};