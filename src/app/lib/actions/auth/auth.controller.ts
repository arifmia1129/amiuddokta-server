"use server";

import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { changePasswordService, loginService } from "./auth.service";

const secretKey =
  "20c37fdadbd59da92a1ac8ff40a47e7e4c67ef048f6c74a70f1c39c8608a8c939ba355760b557cc8a38d286e277c8b773e08527682fd7f0899d0339c2a69016b";

export const encrypt = async (payload: any) => {
  return await sign(payload, secretKey, {
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
  });
};

export const decrypt = async (token: string): Promise<any> => {
  return verify(token, secretKey);
};

export const loginController = async (data: {
  email: string;
  password: string;
}): Promise<any> => {
  if (!data.email) {
    return {
      success: false,
      statusCode: 400,
      message: "Email must be required",
    };
  }
  if (!data.password) {
    return {
      success: false,
      statusCode: 400,
      message: "Password must be required",
    };
  }

  const user = await loginService(data);

  if ((user as any)?.success === false) {
    return user;
  }

  // Create the session
  const expires = new Date(Date.now() + 360 * 24 * 60 * 60 * 1000);

  const { password, ...other } = user as any;

  const session = await encrypt(other);

  //   // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });
  return {
    success: true,
    statusCode: 200,
    message: "Successfully logged in",
    data: { ...other, accessToken: session },
  };
};

export const logoutController = async () => {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
};

export const getSessionController = async () => {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  const res = await decrypt(session);

  const { password, ...other } = res;

  return { ...other, token: session };
};

export const updateSessionController = async (request: NextRequest) => {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
};

export const changePasswordController = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const session = await getSessionController();
  if (!session) {
    return {
      success: false,
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  const userId = session.id;

  return await changePasswordService(
    userId,
    data.currentPassword,
    data.newPassword,
  );
};
export const resetPasswordController = async (email: string) => {
  const session = await getSessionController();
  if (!session) {
    return {
      success: false,
      statusCode: 401,
      message: "Unauthorized",
    };
  }
};
