import { NextRequest } from "next/server";
import {
  getAllAddressesController,
  createAddressController,
} from "@/app/lib/actions/address/address.controller";

// GET - Retrieve addresses with pagination and filtering
export async function GET(request: NextRequest) {
  return await getAllAddressesController(request);
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  return await createAddressController(request);
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};