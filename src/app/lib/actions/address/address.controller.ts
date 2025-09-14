"use server";

import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/actions/auth/auth.controller";
import {
  getAllAddressesService,
  createAddressService,
  updateAddressService,
  deleteAddressService,
  AddressCreateData,
  AddressQueryParams,
} from "./address.service";

export const getAllAddressesController = async (request: NextRequest) => {
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
    const params: AddressQueryParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      search: searchParams.get("search") || "",
      wardId: searchParams.get("ward_id") ? parseInt(searchParams.get("ward_id")!) : undefined,
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: (searchParams.get("sortOrder") as 'asc' | 'desc') || "desc",
    };

    const result = await getAllAddressesService(Number(decodeUser.id), params);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in getAllAddressesController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const createAddressController = async (request: NextRequest) => {
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

    const data: AddressCreateData = await request.json();
    const result = await createAddressService(Number(decodeUser.id), data);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in createAddressController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const updateAddressController = async (request: NextRequest) => {
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

    const body = await request.json();
    
    // Handle both {id, data: {fields}} and {id, ...fields} formats
    const addressId = body.id;
    const updateData = body.data || body;
    
    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const result = await updateAddressService(
      Number(decodeUser.id),
      Number(addressId),
      updateData
    );

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in updateAddressController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const deleteAddressController = async (request: NextRequest) => {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteAddressService(
      Number(decodeUser.id),
      Number(id)
    );

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in deleteAddressController:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};