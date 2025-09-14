import { NextRequest } from "next/server";
import { updateAddressController } from "@/app/lib/actions/address/address.controller";

// PUT - Update an existing address
export async function PUT(request: NextRequest) {
  return await updateAddressController(request);
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT,OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};