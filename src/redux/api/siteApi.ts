import { getSessionController } from "@/app/lib/actions/auth/auth.controller";
import constant from "@/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const siteApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: constant.siteBaseUrl,
    prepareHeaders: async (headers, { getState }) => {
      try {
        const res = await getSessionController();
        if (res?.token) {
          headers.set("Authorization", res.token);
        }
      } catch (error) {
        console.error("Failed to set authorization header:", error);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
