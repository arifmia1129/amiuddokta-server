import { cookies } from "next/headers";
import {
  authLoginController,
  authUpdateProfileController,
  authChangePasswordController,
  authResetPasswordController,
  authForgotPasswordController,
} from "../../src/app/lib/actions/subscriberAuth/subscriberAuth.controller";
import {
  authLoginService,
  authUpdateProfileService,
  authChangePasswordService,
  resetPassword,
  authForgotPasswordService,
} from "../../src/app/lib/actions/subscriberAuth/subscriberAuth.service";

jest.mock("../../src/app/lib/actions/subscriberAuth/subscriberAuth.service");
jest.mock("next/headers");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_jwt_token"),
  verify: jest.fn().mockReturnValue({ email: "johndoe@example.com" }),
}));

describe("authLoginController", () => {
  it("should return error if email is missing", async () => {
    const result = await authLoginController({
      email: "",
      password: "112233",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Email must be required",
    });
  });

  it("should return error if password is missing", async () => {
    const result = await authLoginController({
      email: "johndoe@example.com",
      password: "",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Password must be required",
    });
  });

  it("should return error if authLoginService fails", async () => {
    (authLoginService as jest.Mock).mockResolvedValueOnce({
      success: false,
      statusCode: 404,
      message: "User not found",
    });

    const result = await authLoginController({
      email: "johndoe@example.com",
      password: "112233",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 404,
      message: "User not found",
    });
  });

  it("should return success if authLoginService succeeds", async () => {
    const mockUser = { id: 1, email: "johndoe@example.com" };
    (authLoginService as jest.Mock).mockResolvedValueOnce(mockUser);

    const result = await authLoginController({
      email: "johndoe@example.com",
      password: "112233",
    });

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: "Successfully logged in",
      data: "mocked_jwt_token",
    });
  });
});

describe("authUpdateProfileController", () => {
  it("should return error if token is missing", async () => {
    const result = await authUpdateProfileController({
      data: { name: "John" },
    });

    expect(result).toEqual({
      success: false,
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  it("should return error if data is missing", async () => {
    const result = await authUpdateProfileController({
      token: "mocked_jwt_token",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Update information required",
    });
  });

  it("should return success if authUpdateProfileService succeeds", async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
    };
    (authUpdateProfileService as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authUpdateProfileController({
      token: "mocked_jwt_token",
      data: { name: "John" },
    });

    expect(result).toEqual(mockResponse);
  });
});

describe("authChangePasswordController", () => {
  it("should return error if token is missing", async () => {
    const result = await authChangePasswordController({
      data: { oldPassword: "112233", newPassword: "445566" },
    });

    expect(result).toEqual({
      success: false,
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  it("should return error if passwords are missing", async () => {
    const result = await authChangePasswordController({
      token: "mocked_jwt_token",
      data: { oldPassword: "", newPassword: "" },
    });

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Passwords needed for reset password",
    });
  });

  it("should return success if authChangePasswordService succeeds", async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
    };
    (authChangePasswordService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await authChangePasswordController({
      token: "mocked_jwt_token",
      data: { oldPassword: "112233", newPassword: "445566" },
    });

    expect(result).toEqual(mockResponse);
  });
});

describe("authResetPasswordController", () => {
  it("should return error if token is missing", async () => {
    const result = await authResetPasswordController({
      password: "445566",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 401,
      message: "Token needed for reset password",
    });
  });

  it("should return error if password is missing", async () => {
    const result = await authResetPasswordController({
      token: "mocked_jwt_token",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Password needed for reset password",
    });
  });

  it("should return success if resetPassword succeeds", async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
    };
    (resetPassword as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authResetPasswordController({
      token: "mocked_jwt_token",
      password: "445566",
    });

    expect(result).toEqual(mockResponse);
  });
});

describe("authForgotPasswordController", () => {
  it("should return error if email is missing", async () => {
    const result = await authForgotPasswordController({});

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Email is required",
    });
  });

  it("should return success if authForgotPasswordService succeeds", async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: "Password reset email sent successfully",
    };
    (authForgotPasswordService as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const result = await authForgotPasswordController({
      email: "johndoe@example.com",
    });

    expect(result).toEqual(mockResponse);
  });
});
