import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bdrisApplicationErrors } from '@/db/schema/applications';
import { eq, desc, and } from 'drizzle-orm';
import { decrypt } from '@/app/lib/actions/auth/auth.controller';

// GET - Fetch user's BDRIS application errors
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const decodeUser = await decrypt(authHeader);
    if (!decodeUser?.id) {
      return NextResponse.json(
        { error: "Invalid user token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereConditions = [eq(bdrisApplicationErrors.userId, Number(decodeUser.id))];

    const errors = await db
      .select()
      .from(bdrisApplicationErrors)
      .where(and(...whereConditions))
      .orderBy(desc(bdrisApplicationErrors.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: errors,
      total: errors.length
    });

  } catch (error) {
    console.error('BDRIS application errors fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BDRIS application errors' },
      { status: 500 }
    );
  }
}

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