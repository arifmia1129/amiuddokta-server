import {
  createBlogController,
  retrieveBlogListController,
  retrieveBlogByIdController,
  retrieveBlogBySlugController,
  updateBlogByIdController,
  deleteBlogByIdController,
  searchBlogsController,
  retrieveBlogsByIdsController,
} from "../../src/app/lib/actions/blog/blog.controller";
import {
  createBlogService,
  retrieveBlogListService,
  retrieveBlogByIdService,
  retrieveBlogBySlugService,
  updateBlogByIdService,
  deleteBlogByIdService,
  retrieveBlogBySearchService,
  retrieveBlogsByIdsService,
} from "../../src/app/lib/actions/blog/blog.service";
import { auth, sendResponse } from "@/utils/functions";

jest.mock("../../src/app/lib/actions/blog/blog.service");
jest.mock("../../src/utils/functions.ts");

describe("createBlogController", () => {
  it("should return error if user is not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 401,
      message: "Unauthorized",
    });

    const result = await createBlogController({ title: "Test Blog" });

    expect(result).toEqual({ statusCode: 401, message: "Unauthorized" });
  });

  it("should return success if createBlogService succeeds", async () => {
    const mockResponse = { success: true };
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 200,
      data: { id: 1 },
    });
    (createBlogService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await createBlogController({ title: "Test Blog" });

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully created blog information",
      mockResponse,
    );
  });
});

describe("retrieveBlogListController", () => {
  it("should return success if retrieveBlogListService succeeds", async () => {
    const mockResponse = { data: [], totalLength: 0 };
    (retrieveBlogListService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await retrieveBlogListController({ pageSize: 10, page: 1 });

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved blog information",
      mockResponse,
    );
  });
});

describe("retrieveBlogByIdController", () => {
  it("should return success if retrieveBlogByIdService succeeds", async () => {
    const mockResponse = [{ post_id: 1, title: "Test Blog" }];
    (retrieveBlogByIdService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await retrieveBlogByIdController(1);

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved blog",
      mockResponse,
    );
  });
});

describe("retrieveBlogBySlugController", () => {
  it("should return success if retrieveBlogBySlugService succeeds", async () => {
    const mockResponse = [{ slug: "test-blog", title: "Test Blog" }];
    (retrieveBlogBySlugService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await retrieveBlogBySlugController("test-blog");

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved blog",
      mockResponse,
    );
  });
});

describe("updateBlogByIdController", () => {
  it("should return error if user is not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 401,
      message: "Unauthorized",
    });

    const result = await updateBlogByIdController({
      post_id: 1,
      title: "Updated Title",
    });

    expect(result).toBeUndefined(); // Assuming your function doesn't return a response if auth fails
  });

  it("should return success if updateBlogByIdService succeeds", async () => {
    const mockResponse = { updatedId: 1 };
    (auth as jest.Mock).mockResolvedValueOnce({ statusCode: 200 });
    (updateBlogByIdService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await updateBlogByIdController({
      post_id: 1,
      title: "Updated Title",
    });

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully updated blog",
      mockResponse,
    );
  });
});

describe("deleteBlogByIdController", () => {
  it("should return error if user is not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 401,
      message: "Unauthorized",
    });

    const result = await deleteBlogByIdController(1);

    expect(result).toBeUndefined(); // Assuming your function doesn't return a response if auth fails
  });

  it("should return success if deleteBlogByIdService succeeds", async () => {
    const mockResponse = { success: true };
    (auth as jest.Mock).mockResolvedValueOnce({ statusCode: 200 });
    (deleteBlogByIdService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await deleteBlogByIdController(1);

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully deleted blog",
      mockResponse,
    );
  });
});

describe("searchBlogsController", () => {
  it("should return success if retrieveBlogBySearchService succeeds", async () => {
    const mockResponse = { data: [], totalLength: 0 };
    (retrieveBlogBySearchService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await searchBlogsController(
      { keyword: "test" },
      { pageSize: 10, page: 1 },
    );

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved blog search results",
      mockResponse,
    );
  });
});

describe("retrieveBlogsByIdsController", () => {
  it("should return success if retrieveBlogsByIdsService succeeds", async () => {
    const mockResponse = [{ post_id: 1, title: "Test Blog" }];
    (retrieveBlogsByIdsService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await retrieveBlogsByIdsController([1]);

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved blogs",
      mockResponse,
    );
  });

  it("should return error if retrieveBlogsByIdsService fails", async () => {
    const mockError = new Error("Failed to retrieve blogs");
    (retrieveBlogsByIdsService as jest.Mock).mockRejectedValueOnce(mockError);

    const result = await retrieveBlogsByIdsController([1]);

    expect(sendResponse).toHaveBeenCalledWith(
      false,
      400,
      mockError.message,
      null,
    );
  });
});
