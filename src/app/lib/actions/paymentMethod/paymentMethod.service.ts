"use server";

import { db } from "@/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { paymentMethods } from "@/db/schema";

export const createPaymentMethodService = async (data: any) => {
  try {
    return await db.insert(paymentMethods).values(data);
  } catch (error: any) {
    throw new Error(error.message || "Failed to create payment method");
  }
};

export const retrievePaymentMethodListService = async (pagination: any) => {
  try {
    const { page, pageSize } = pagination;

    const methodsList = await db
      .select()
      .from(paymentMethods)
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(paymentMethods.id));

    const totalCount = await db.select({ count: count() }).from(paymentMethods);

    return { data: methodsList, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Error retrieving payment methods list");
  }
};

export const retrievePaymentMethodByIdService = async (id: number) => {
  try {
    const result = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error: any) {
    throw new Error("Failed to retrieve payment method by ID");
  }
};

export const updatePaymentMethodService = async (
  id: number,
  data: Partial<typeof paymentMethods>,
) => {
  try {
    return await db
      .update(paymentMethods)
      .set({ ...data, updated_at: new Date() } as any)
      .where(eq(paymentMethods.id, id))
      .returning();
  } catch (error: any) {
    throw new Error("Failed to update payment method");
  }
};

export const deletePaymentMethodService = async (id: number) => {
  try {
    return await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  } catch (error: any) {
    throw new Error("Failed to delete payment method");
  }
};

export const searchPaymentMethodService = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const { keyword } = searchParams;
    const keywordPattern = `%${keyword}%`;

    const searchConditions = sql`
      LOWER(${paymentMethods.payment_method}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${paymentMethods.account}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${paymentMethods.type}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${paymentMethods.details}) LIKE LOWER(${keywordPattern})
    `;

    const results = await db
      .select()
      .from(paymentMethods)
      .where(searchConditions)
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(paymentMethods.id));

    const totalCount = await db
      .select({ count: count() })
      .from(paymentMethods)
      .where(searchConditions);

    return { data: results, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Search failed");
  }
};
