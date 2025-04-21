"use server";

import { db } from "@/db";
import { count, desc, eq, sql } from "drizzle-orm";
import { sendResponse } from "@/utils/functions";
import bcrypt from "bcryptjs";
import { settings } from "@/db/schema";

export const createSettingService = async (data: any) => {
  try {
    const res = await db.insert(settings).values(data);
    return res;
  } catch (error) {
    return sendResponse(false, 500, "Internal server error", error);
  }
};

export const retrieveSettingListService = async (pagination: any) => {
  const res = await db
    .select()
    .from(settings)
    .limit(Number(pagination.pageSize))
    .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
    .orderBy(desc(settings.id));
  const totalCount = (await db
    .select({ count: count() })
    .from(settings)) as any;

  return { data: res, totalLength: totalCount[0].count };
};
export const retrieveAllCategories = async () => {
  const res = await db.select().from(settings);

  return res;
};

export const retrieveSettingByIdService = async (id: number) => {
  return await db.select().from(settings).where(eq(settings.id, id));
};
export const retrieveSettingByModuleService = async (module: string) => {
  const lowerModule = module.toLowerCase(); // Convert module to lowercase
  return await db
    .select()
    .from(settings)
    .where(sql`LOWER(${settings.module}) = ${lowerModule}`);
};
export const updateSettingByIdService = async (data: any) => {
  return await db.update(settings).set(data).where(eq(settings.id, data.id));
};

export const deleteSettingByIdService = async (id: number) => {
  return await db.delete(settings).where(eq(settings.id, id));
};
