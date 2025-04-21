"use server";

import { db } from "@/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { rechargeRequests, users } from "@/db/schema";

export const createRechargeRequestService = async (data: any) => {
  try {
    return await db.insert(rechargeRequests).values(data);
  } catch (error: any) {
    throw new Error(error.message || "Failed to create recharge request");
  }
};

export const retrieveRechargeRequestListService = async (pagination: any) => {
  try {
    const { page, pageSize } = pagination;
    const requestsList = await db
      .select({
        id: rechargeRequests.id,
        userId: rechargeRequests.user_id,
        type: rechargeRequests.type,
        fromAccount: rechargeRequests.from_account,
        amount: rechargeRequests.amount,
        transactionId: rechargeRequests.transaction_id,
        status: rechargeRequests.status,
        createdAt: rechargeRequests.created_at,
        userName: users.name,
        userEmail: users.email,
      })
      .from(rechargeRequests)
      .innerJoin(users, eq(rechargeRequests.user_id, users.id))
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(rechargeRequests.id));

    const totalCount = await db
      .select({ count: count() })
      .from(rechargeRequests);

    return { data: requestsList, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Error retrieving recharge request list");
  }
};
export const retrieveRechargeRequestListByUserIdService = async (
  userId: number,
  pagination: any,
) => {
  try {
    const { page, pageSize } = pagination;

    const requestsList = await db
      .select({
        id: rechargeRequests.id,
        userId: rechargeRequests.user_id,
        type: rechargeRequests.type,
        fromAccount: rechargeRequests.from_account,
        amount: rechargeRequests.amount,
        transactionId: rechargeRequests.transaction_id,
        status: rechargeRequests.status,
        createdAt: rechargeRequests.created_at,
        userName: users.name,
        userEmail: users.email,
      })
      .from(rechargeRequests)
      .innerJoin(users, eq(rechargeRequests.user_id, users.id))
      .where(eq(rechargeRequests.user_id, Number(userId))) // Corrected filter using eq
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(rechargeRequests.id));

    const totalCount = await db
      .select({ count: count() })
      .from(rechargeRequests)
      .where(eq(rechargeRequests.user_id, Number(userId))); // Corrected filter using eq

    return { data: requestsList, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Error retrieving recharge request list by userId");
  }
};

export const updateRechargeRequestStatusService = async (
  id: number,
  status: "approved" | "rejected",
) => {
  try {
    const result = await db.transaction(async (tx) => {
      const updatedRequest = await tx
        .update(rechargeRequests)
        .set({ status, updated_at: new Date() })
        .where(eq(rechargeRequests.id, id))
        .returning();

      if (status === "approved") {
        await tx
          .update(users)
          .set({
            balance: sql`${users.balance} + ${updatedRequest[0].amount}`,
            updated_at: new Date(),
          })
          .where(eq(users.id, updatedRequest[0].user_id));
      }

      return updatedRequest[0];
    });

    return result;
  } catch (error: any) {
    throw new Error("Failed to update recharge request status");
  }
};

export const retrieveRechargeRequestSearchService = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const { keyword } = searchParams;
    const keywordPattern = `%${keyword}%`;

    const searchConditions = sql`
      LOWER(${users.name}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${users.email}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${rechargeRequests.type}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${rechargeRequests.from_account}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${rechargeRequests.transaction_id}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${rechargeRequests.status}) LIKE LOWER(${keywordPattern})
    `;

    const results = await db
      .select({
        id: rechargeRequests.id,
        userId: rechargeRequests.user_id,
        type: rechargeRequests.type,
        fromAccount: rechargeRequests.from_account,
        amount: rechargeRequests.amount,
        transactionId: rechargeRequests.transaction_id,
        status: rechargeRequests.status,
        createdAt: rechargeRequests.created_at,
        userName: users.name,
        userEmail: users.email,
      })
      .from(rechargeRequests)
      .innerJoin(users, eq(rechargeRequests.user_id, users.id))
      .where(searchConditions)
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(rechargeRequests.id));

    const totalCount = await db
      .select({ count: count() })
      .from(rechargeRequests)
      .innerJoin(users, eq(rechargeRequests.user_id, users.id))
      .where(searchConditions);

    return { data: results, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Search failed");
  }
};
