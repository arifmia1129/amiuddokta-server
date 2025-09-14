import { NextRequest } from "next/server";
import { deleteAddressController } from "@/app/lib/actions/address/address.controller";

// DELETE - Delete an address
export async function DELETE(request: NextRequest) {
  return await deleteAddressController(request);
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE,OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};