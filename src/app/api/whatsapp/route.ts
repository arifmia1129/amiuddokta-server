import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "WhatsApp API is running" });
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  // Handle WhatsApp API requests
  return NextResponse.json({ success: true, data });
}
