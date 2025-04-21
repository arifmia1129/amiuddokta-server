import { cookies } from "next/headers";
import { loginController } from "../../src/app/lib/actions/auth/auth.controller";
import { loginService } from "../../src/app/lib/actions/auth/auth.service";

jest.mock("../../src/app/lib/actions/auth/auth.service.ts");
jest.mock("next/headers");

describe("loginController", () => {
  it("should return error if email is missing", async () => {
    const result = await loginController({
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
    const result = await loginController({
      email: "johndoe@example.com",
      password: "",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Password must be required",
    });
  });

  it("should return error if loginService fails", async () => {
    (loginService as jest.Mock).mockResolvedValueOnce({
      success: false,
      statusCode: 404,
      message: "User not found",
    });

    const result = await loginController({
      email: "johndoe@example.com",
      password: "112233",
    });

    expect(result).toEqual({
      success: false,
      statusCode: 404,
      message: "User not found",
    });
  });

  it("should return success if loginService succeeds", async () => {
    const mockUser = { id: 1, email: "johndoe@example.com" };
    (loginService as jest.Mock).mockResolvedValueOnce(mockUser);
    const setCookie = jest.fn();
    (cookies as jest.Mock).mockReturnValue({ set: setCookie });

    const result = await loginController({
      email: "johndoe@example.com",
      password: "112233",
    });

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: "Successfully logged in",
    });
  });
});
