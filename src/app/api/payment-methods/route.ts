import {
  retrievePaymentMethodByIdController,
  retrievePaymentMethodListController,
  searchPaymentMethodController,
} from "@/app/lib/actions/paymentMethod/paymentMethod.controller";
import { NextRequest, NextResponse } from "next/server";

// Define the Pagination type with the required properties
type Pagination = {
  blog: number;
  blogSize: number;
};

export const GET = async (req: NextRequest) => {
  console.log("hitting");
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const keyword = searchParams.get("keyword");
    const status = searchParams.get("status");

    if (id) {
      const retrieveResult = (await retrievePaymentMethodByIdController(
        Number(id),
      )) as any;

      return NextResponse.json(retrieveResult, {
        status: retrieveResult.statusCode,
      });
    } else if (keyword || status) {
      const pagination: any = {
        page: parseInt(searchParams.get("page") || "1", 10),
        pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
      } as any;

      const searchParamsObject = {
        keyword: keyword || "",
        status: status || "",
      };

      const searchResult = await searchPaymentMethodController(
        searchParamsObject,
        pagination as any,
      );
      return NextResponse.json(searchResult, {
        status: searchResult.statusCode,
      });
    } else {
      // Handle list functionality
      const pagination: any = {
        page: parseInt(searchParams.get("page") || "1", 10),
        pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
      } as any;
      const listResult = await retrievePaymentMethodListController(
        pagination as any,
      );
      return NextResponse.json(listResult, { status: listResult.statusCode });
    }
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
      "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
      "Access-Control-Allow-Headers":
        "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    },
  });
};
