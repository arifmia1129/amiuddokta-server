import { updateSessionController } from "@/app/lib/actions/auth/auth.controller";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSessionController(request);
}
