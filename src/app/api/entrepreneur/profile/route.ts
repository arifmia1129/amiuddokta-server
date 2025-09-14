import { NextRequest } from "next/server";
import { 
  getEntrepreneurProfileController 
} from "@/app/lib/actions/entrepreneur/entrepreneur.controller";

export const GET = async (req: NextRequest) => {
  return await getEntrepreneurProfileController(req);
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
