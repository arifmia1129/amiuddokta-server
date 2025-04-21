import { siteApi } from "@/redux/api/siteApi";

const siteApiSlice = siteApi.injectEndpoints({
  endpoints: (build) => ({
    addSite: build.mutation({
      query(body) {
        return {
          url: `/site`,
          method: "POST",
          body,
        };
      },
    }),
    updateSite: build.mutation({
      query({ id, body }) {
        return {
          url: `/site/${id}`,
          method: "PATCH",
          body,
        };
      },
    }),
    deleteSite: build.mutation({
      query(id) {
        return {
          url: `/site/${id}`,
          method: "DELETE",
        };
      },
    }),
    getAllSites: build.query({
      query: ({ page, limit }) => `/site?page=${page}&limit=${limit}`,
      transformResponse: (res: any) => {
        if (res?.success) {
          return res?.data;
        } else {
          return [];
        }
      },
    }),
    getSiteById: build.query({
      query: (id) => `/site/${id}`,
      transformResponse: (res: any) => {
        if (res?.success) {
          return res?.data;
        } else {
          return {};
        }
      },
    }),
    getAllSiteCategories: build.query({
      query: ({ page, limit }) => `/site-category?page=${page}&limit=${limit}`,
      transformResponse: (res: any) => {
        if (res?.success) {
          return res?.data;
        } else {
          return [];
        }
      },
    }),
    addSiteCategory: build.mutation({
      query(body) {
        return {
          url: `/site-category`,
          method: "POST",
          body,
        };
      },
    }),
    updateSiteCategory: build.mutation({
      query({ id, body }) {
        return {
          url: `/site-category/${id}`,
          method: "PATCH",
          body,
        };
      },
    }),
    getSiteCategoryById: build.query({
      query: (id) => `/site-category/${id}`,
      transformResponse: (res: any) => {
        if (res?.success) {
          return res?.data;
        } else {
          return {};
        }
      },
    }),
    deleteSiteCategory: build.mutation({
      query(id) {
        return {
          url: `/site-category/${id}`,
          method: "DELETE",
        };
      },
    }),

    // user site list
    getAllUserSites: build.query({
      query: ({ page, limit }) => `/user-site-list?page=${page}&limit=${limit}`,
      transformResponse: (res: any) => {
        if (res?.success) {
          return res?.data;
        } else {
          return [];
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddSiteMutation,
  useUpdateSiteMutation,
  useGetAllSitesQuery,
  useGetSiteByIdQuery,
  useGetAllSiteCategoriesQuery,
  useAddSiteCategoryMutation,
  useUpdateSiteCategoryMutation,
  useGetSiteCategoryByIdQuery,
  useLazyGetSiteByIdQuery,
  useDeleteSiteMutation,
  useDeleteSiteCategoryMutation,

  // user site
  useGetAllUserSitesQuery,
} = siteApiSlice;
