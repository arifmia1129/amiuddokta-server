"use server";

import bcrypt from "bcryptjs";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export const changePasswordService = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
) => {
  const res = await db.select().from(users).where(eq(users.id, userId));
  const user = res[0];

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.pin as string,
  );
  if (!isMatch) {
    return {
      success: false,
      statusCode: 400,
      message: "Current password is incorrect",
    };
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ pin: hashedNewPassword })
    .where(eq(users.id, userId));

  return {
    success: true,
    statusCode: 200,
    message: "Password successfully changed",
  };
};
// export const resetPasswordService = async (email: string) => {
//   try {
//     const res = await db.select().from(users).where(eq(users.email, email));
//     const user = res[0];

//     if (!user) {
//       return {
//         success: false,
//         statusCode: 404,
//         message: "User not found",
//       };
//     }

//     const newPassword = generateRandomPassword();

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//     await db
//       .update(users)
//       .set({ pin: hashedNewPassword })
//       .where(eq(users.email, email));

//     const templateName = await getFieldValue("admin_reset_password_template");

//     const response = await retrieveEmailTemplateByNameController(
//       templateName as string,
//     );
//     const emailTemplate = response?.data;

//     if (emailTemplate?.body) {
//       let emailBody = emailTemplate.body
//         .replace(/{{name}}/g, user?.name)
//         .replace(/{{email}}/g, email)
//         .replace(/{{password}}/g, newPassword);

//       const res = await sendEmail(null, false, {
//         subject: emailTemplate.subject.replace(/{{name}}/g, user?.name),
//         body: emailBody,
//         recipients: email,
//       });
//     }

//     return {
//       success: true,
//       statusCode: 200,
//       message: "Reset password email sent successfully",
//     };
//   } catch (error) {
//     throw new Error("Failed to send reset email");
//   }
// };

export const resetPasswordService = async (userId: number, isAdminReset = false) => {
  try {
    // Find the user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    // Generate a temporary password (8 characters: 4 digits + 4 letters)
    const generateTempPassword = () => {
      const digits = Math.floor(1000 + Math.random() * 9000).toString();
      const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
      return digits + letters;
    };

    const temporaryPassword = generateTempPassword();
    
    // Hash the temporary password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

    // Update the user's password (using PIN field for BDRIS users)
    await db
      .update(users)
      .set({
        pin: hashedPassword,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      statusCode: 200,
      message: "Password reset successfully",
      temporaryPassword: isAdminReset ? temporaryPassword : undefined,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to reset password",
    };
  }
};

export const updateUserStatusService = async (userId: number, status: string) => {
  try {
    // Find the user first
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    // Update the user's status
    await db
      .update(users)
      .set({
        status: status as any,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      statusCode: 200,
      message: "User status updated successfully",
    };
  } catch (error) {
    console.error("Update user status error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update user status",
    };
  }
};

export const loginService = async (data: {
  email: string;
  password: string;
}) => {
  const res = await db.select().from(users).where(eq(users.phone, data.email));
  const user = res[0];

  if (user?.phone !== data.email) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  const isMatch = await bcrypt.compare(data.password, user.pin as string);
  if (!isMatch) {
    return {
      success: false,
      statusCode: 400,
      message: "Email or password is incorrect",
    };
  }

  return user;
};
