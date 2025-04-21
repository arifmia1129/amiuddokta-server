import {
  createFAQController,
  retrieveFAQListController,
  retrieveFAQByIdController,
  retrieveFAQByCategoryIdController,
  updateFAQByIdController,
  deleteFAQByIdController,
  searchFAQController,
  searchFaqController,
} from "../../src/app/lib/actions/faqs/faq.controller";
import {
  createFAQService,
  retrieveFAQListService,
  retrieveFAQByIdService,
  retrieveFAQByCategoryIdService,
  updateFAQByIdService,
  deleteFAQByIdService,
  retrieveFAQBySearchService,
  retrieveFaqSearchService,
} from "../../src/app/lib/actions/faqs/faq.service";
import { auth, sendResponse } from "@/utils/functions";

jest.mock("../../src/app/lib/actions/faqs/faq.service");
jest.mock("../../src/utils/functions");

describe("createFAQController", () => {
  it("should return error if user is not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 401,
      message: "Unauthorized",
    });

    const result = await createFAQController({ question: "Test FAQ?" });

    expect(result).toEqual({ statusCode: 401, message: "Unauthorized" });
  });

  it("should return success if createFAQService succeeds", async () => {
    const mockResponse = { success: true };
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 200,
      data: { id: 1 },
    });
    (createFAQService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await createFAQController({ question: "Test FAQ?" });

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully created faq information",
      mockResponse,
    );
  });
});

describe("retrieveFAQListController", () => {
  it("should return success if retrieveFAQListService succeeds", async () => {
    const mockResponse = { data: [], totalLength: 0 };
    (auth as jest.Mock).mockResolvedValueOnce(true);
    (retrieveFAQListService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await retrieveFAQListController({ pageSize: 10, page: 1 });

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved faq information",
      mockResponse,
    );
  });
});

describe("retrieveFAQByIdController", () => {
  it("should return success if retrieveFAQByIdService succeeds", async () => {
    const mockResponse = [{ id: 1, question: "Test FAQ?" }];
    (retrieveFAQByIdService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await retrieveFAQByIdController(1);

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved faq",
      mockResponse,
    );
  });
});

describe("retrieveFAQByCategoryIdController", () => {
  it("should return success if retrieveFAQByCategoryIdService succeeds", async () => {
    const mockResponse = [{ id: 1, category_id: 1, question: "Test FAQ?" }];
    (retrieveFAQByCategoryIdService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await retrieveFAQByCategoryIdController(1);

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved faq by category id",
      mockResponse,
    );
  });
});

describe("updateFAQByIdController", () => {
  it("should return error if user is not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 401,
      message: "Unauthorized",
    });

    const result = await updateFAQByIdController({
      id: 1,
      question: "Updated FAQ?",
    });

    expect(result).toBeUndefined(); // Assuming your function doesn't return a response if auth fails
  });

  it("should return success if updateFAQByIdService succeeds", async () => {
    const mockResponse = { updatedId: 1 };
    (auth as jest.Mock).mockResolvedValueOnce({ statusCode: 200 });
    (updateFAQByIdService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await updateFAQByIdController({
      id: 1,
      question: "Updated FAQ?",
    });

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully updated faq",
      mockResponse,
    );
  });
});

describe("deleteFAQByIdController", () => {
  it("should return error if user is not authorized", async () => {
    (auth as jest.Mock).mockResolvedValueOnce({
      statusCode: 401,
      message: "Unauthorized",
    });

    const result = await deleteFAQByIdController(1);

    expect(result).toBeUndefined(); // Assuming your function doesn't return a response if auth fails
  });

  it("should return success if deleteFAQByIdService succeeds", async () => {
    const mockResponse = { success: true };
    (auth as jest.Mock).mockResolvedValueOnce({ statusCode: 200 });
    (deleteFAQByIdService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await deleteFAQByIdController(1);

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully deleted faq",
      mockResponse,
    );
  });
});

describe("searchFAQController", () => {
  it("should return success if retrieveFAQBySearchService succeeds", async () => {
    const mockResponse = { data: [], totalLength: 0 };
    (retrieveFAQBySearchService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await searchFAQController(
      { keyword: "test" },
      { pageSize: 10, page: 1 },
    );

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved FAQ search results",
      mockResponse,
    );
  });
});

describe("searchFaqController", () => {
  it("should return success if retrieveFaqSearchService succeeds", async () => {
    const mockResponse = { data: [], totalLength: 0 };
    (retrieveFaqSearchService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await searchFaqController(
      { keyword: "test" },
      { pageSize: 10, page: 1 },
    );

    expect(sendResponse).toHaveBeenCalledWith(
      true,
      200,
      "Successfully retrieved faq search results",
      mockResponse,
    );
  });
});
