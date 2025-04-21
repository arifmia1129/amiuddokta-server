import { NextRequest, NextResponse } from "next/server";
import { retrieveSettingByModuleController } from "@/app/lib/actions/setting/setting.controller";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get("module");

    if (!moduleName) {
      return NextResponse.json(
        { success: false, message: "Module parameter is required" },
        { status: 400 },
      );
    }

    const retrieveResult = await retrieveSettingByModuleController(moduleName);

    // Ensure setting_fields is parsed JSON if it's a string
    if (retrieveResult.data?.[0]?.setting_fields) {
      retrieveResult.data[0].setting_fields =
        typeof retrieveResult.data[0].setting_fields === "string"
          ? JSON.parse(retrieveResult.data[0].setting_fields)
          : retrieveResult.data[0].setting_fields;
    }

    return NextResponse.json(retrieveResult, {
      status: retrieveResult.statusCode,
    });
  } catch (error: any) {
    console.error("Error retrieving settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve settings" },
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
