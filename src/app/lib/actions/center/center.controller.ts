import { readFileSync } from "fs";
import { join } from "path";
import { ZodError } from "zod";
import { centerFilterSchema } from "./center.validation";

// Define the path to your center.json file
const centersFilePath = join(process.cwd(), "src/data/center.json");

// Define the type for a center
type Center = {
  id: number;
  center_name: string;
  center_type: string;
  division: string;
  district: string;
};

// Standard response type for all functions
type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  status?: number;
};

// Read centers from the JSON file
function readCenters(): Center[] {
  const rawData = readFileSync(centersFilePath, "utf-8");
  return JSON.parse(rawData) as Center[];
}

// Get all centers with pagination
export async function getAllCenters(params: {
  page?: number;
  limit?: number;
}): Promise<ActionResponse<Center[]>> {
  try {
    const centers = readCenters();
    const page = params.page || 1;
    const limit = params.limit || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = centers.slice(startIndex, endIndex);

    return {
      success: true,
      message: "Centers retrieved successfully",
      data: results,
      meta: {
        total: centers.length,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting centers:", error);
    return {
      success: false,
      message: "Failed to retrieve centers",
      status: 500,
    };
  }
}

// Get center by ID
export async function getCenterById(params: {
  id: string | number;
}): Promise<ActionResponse<Center>> {
  try {
    const centers = readCenters();
    const centerId =
      typeof params.id === "string" ? parseInt(params.id, 10) : params.id;
    const center = centers.find((c) => c.id === centerId);

    if (!center) {
      return {
        success: false,
        message: "Center not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Center retrieved successfully",
      data: center,
    };
  } catch (error) {
    console.error("Error getting center by ID:", error);
    return {
      success: false,
      message: "Failed to retrieve center",
      status: 500,
    };
  }
}

// Search centers with pagination
export async function searchCenters(params: {
  search?: string;
  division?: string;
  district?: string;
  center_type?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResponse<Center[]>> {
  try {
    const centers = readCenters();
    const { search, division, district, center_type, page, limit } =
      centerFilterSchema.parse(params);

    let filteredCenters = centers;

    if (search) {
      filteredCenters = filteredCenters.filter((c) =>
        c.center_name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (division) {
      filteredCenters = filteredCenters.filter(
        (c) => c.division.toLowerCase() === division.toLowerCase(),
      );
    }

    if (district) {
      filteredCenters = filteredCenters.filter(
        (c) => c.district.toLowerCase() === district.toLowerCase(),
      );
    }

    if (center_type) {
      filteredCenters = filteredCenters.filter(
        (c) => c.center_type.toLowerCase() === center_type.toLowerCase(),
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = filteredCenters.slice(startIndex, endIndex);

    return {
      success: true,
      message: "Centers retrieved successfully",
      data: results,
      meta: {
        total: filteredCenters.length,
        page,
        limit,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation error",
        data: error.format() as any,
        status: 400,
      };
    }

    console.error("Error searching centers:", error);
    return {
      success: false,
      message: "Failed to retrieve centers",
      status: 500,
    };
  }
}
