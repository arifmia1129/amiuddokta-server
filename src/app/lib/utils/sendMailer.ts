"use server";

// lib/sendEmail.ts
import nodemailer from "nodemailer";

const sendEmail = async (
  to: string | string[],
  subject: string,
  body: string,
) => {
  try {
    // Create a transporter using SMTP settings
    const transporter = nodemailer.createTransport({
      host: "mail.myseba24.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: "info@myseba24.com",
        pass: process.env.EMAIL_PASSWORD as string, // Use an environment variable for the password
      },
    });

    // Ensure the "to" field is a comma-separated string if it's an array
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    // Define email options
    const mailOptions = {
      from: "info@myseba24.com",
      to: recipients,
      subject,
      text: body,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default sendEmail;
