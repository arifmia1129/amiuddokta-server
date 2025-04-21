"use server";

import { db } from "@/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { agentFees, users } from "@/db/schema";

export const createAgentFeeService = async (data: any) => {
  try {
    return await db.insert(agentFees).values(data);
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message || "Failed to create agent fee");
  }
};

export const retrieveAgentFeeListService = async (pagination: any) => {
  try {
    const { page, pageSize } = pagination;
    const feesList = await db
      .select({
        id: agentFees.id,
        agentId: agentFees.agent_id,
        subAgentId: agentFees.sub_agent_id,
        applicationType: agentFees.application_type,
        feePerApplication: agentFees.fee_per_application,
        createdAt: agentFees.created_at,
        agentName: users.name,
        subAgentName: sql<string>`(SELECT name FROM ${users} WHERE id = ${agentFees.sub_agent_id})`,
      })
      .from(agentFees)
      .innerJoin(users, eq(agentFees.agent_id, users.id))
      .limit(Number(pageSize))
      .offset((Number(page) - 1) * Number(pageSize))
      .orderBy(desc(agentFees.id));

    const totalCount = await db.select({ count: count() }).from(agentFees);

    return { data: feesList, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Error retrieving agent fee list");
  }
};
export const retrieveAgentFeeByTypeService = async (
  userId: number,
  role: "agent" | "sub_agent",
  type: any,
) => {
  try {
    console.log(userId, role, type);
    const roleColumn =
      role === "agent" ? agentFees.agent_id : agentFees.sub_agent_id;

    const fee = await db
      .select()
      .from(agentFees)
      .where(and(eq(roleColumn, userId), eq(agentFees.application_type, type)))
      .orderBy(desc(agentFees.id));

    return fee[0];
  } catch (error: any) {
    throw new Error(`Error retrieving agent fee list: ${error.message}`);
  }
};

export const updateAgentFeeService = async (data: any) => {
  try {
    return await db
      .update(agentFees)
      .set(data)
      .where(eq(agentFees.id, data.id));
  } catch (error: any) {
    throw new Error("Failed to update agent fee");
  }
};

export const deleteAgentFeeService = async (id: number) => {
  try {
    return await db.delete(agentFees).where(eq(agentFees.id, id));
  } catch (error: any) {
    throw new Error("Failed to delete agent fee");
  }
};

export const retrieveAgentFeeSearchService = async (
  searchParams: any,
  pagination: any,
) => {
  try {
    const { keyword } = searchParams;
    const keywordPattern = `%${keyword}%`;

    const searchConditions = sql`
      LOWER(${users.name}) LIKE LOWER(${keywordPattern}) OR
      LOWER(${agentFees.application_type}) LIKE LOWER(${keywordPattern})
    `;

    const results = await db
      .select({
        id: agentFees.id,
        agentId: agentFees.agent_id,
        subAgentId: agentFees.sub_agent_id,
        applicationType: agentFees.application_type,
        feePerApplication: agentFees.fee_per_application,
        createdAt: agentFees.created_at,
        agentName: users.name,
        subAgentName: sql<string>`(SELECT name FROM ${users} WHERE id = ${agentFees.sub_agent_id})`,
      })
      .from(agentFees)
      .innerJoin(users, eq(agentFees.agent_id, users.id))
      .where(searchConditions)
      .limit(Number(pagination.pageSize))
      .offset((Number(pagination.page) - 1) * Number(pagination.pageSize))
      .orderBy(desc(agentFees.id));

    const totalCount = await db
      .select({ count: count() })
      .from(agentFees)
      .innerJoin(users, eq(agentFees.agent_id, users.id))
      .where(searchConditions);

    return { data: results, totalLength: totalCount[0].count };
  } catch (error: any) {
    throw new Error("Search failed");
  }
};

export const retrieveAgentFeeByIdService = async (id: number) => {
  try {
    const fee = await db
      .select({
        id: agentFees.id,
        agentId: agentFees.agent_id,
        subAgentId: agentFees.sub_agent_id,
        applicationType: agentFees.application_type,
        feePerApplication: agentFees.fee_per_application,
        createdAt: agentFees.created_at,
        agentName: users.name,
        subAgentName: sql<string>`(SELECT name FROM ${users} WHERE id = ${agentFees.sub_agent_id})`,
      })
      .from(agentFees)
      .innerJoin(users, eq(agentFees.agent_id, users.id))
      .where(eq(agentFees.id, id))
      .limit(1);

    if (fee.length === 0) {
      throw new Error("Agent fee not found");
    }

    return fee[0];
  } catch (error: any) {
    throw new Error(`Error retrieving agent fee: ${error.message}`);
  }
};
