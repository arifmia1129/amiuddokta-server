// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { parse, HTMLElement } from "node-html-parser";

interface ParsedResponse {
  isSuccess: boolean;
  applicationId?: string;
  printLink?: string;
  errorMessage?: string;
  additionalInfo?: {
    applicationType?: string;
    officeName?: string;
    phoneNumber?: string;
    submissionDeadline?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { html, responseType = "birth-registration" } = await request.json();

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        {
          error: "Invalid HTML content provided",
        },
        { status: 400 },
      );
    }

    const root = parse(html);
    const result: ParsedResponse = await parseHtmlResponse(root, responseType);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("HTML parsing error:", error);
    return NextResponse.json(
      {
        error: "Failed to parse HTML response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function parseHtmlResponse(
  root: HTMLElement,
  responseType: string,
): Promise<ParsedResponse> {
  try {
    // Check for success indicators first
    const successResult = extractSuccessInfo(root);
    if (successResult.isSuccess) {
      return successResult;
    }

    // Check for error messages
    const errorResult = extractErrorInfo(root);
    return errorResult;
  } catch (error) {
    console.error("DOM parsing failed, falling back to regex:", error);
    // Fallback to regex parsing if DOM parsing fails
    return extractUsingRegex(root.innerHTML);
  }
}

function extractSuccessInfo(root: HTMLElement): ParsedResponse {
  // Look for application number pattern - spans with red color that contain application number text
  const redSpans = root.querySelectorAll(
    'span[style*="color:red"], span[style*="color:#red"]',
  );

  let applicationId = "";

  for (const span of redSpans) {
    const parentText =
      span.parentNode?.innerText || span.parentNode?.innerHTML || "";
    if (
      parentText.includes("আবেদনপত্র নম্বর") ||
      parentText.includes("আবেদন নম্বর")
    ) {
      applicationId = span.innerText.trim();
      break;
    }
  }

  if (applicationId) {
    // Extract print link
    let printLink = "";
    const printButton =
      root.querySelector("#appPrintBtn") ||
      root.querySelector("a.print") ||
      root.querySelector('a[href*="/print/"]');

    if (printButton) {
      printLink = printButton.getAttribute("href") || "";
      // Convert relative URL to absolute if needed
      if (printLink && !printLink.startsWith("http")) {
        printLink = printLink.startsWith("/")
          ? `https://bdris.gov.bd${printLink}`
          : `https://bdris.gov.bd/${printLink}`;
      }
    }

    // Extract additional information
    const additionalInfo = extractAdditionalInfo(root);

    return {
      isSuccess: true,
      applicationId,
      printLink,
      additionalInfo,
    };
  }

  return { isSuccess: false };
}

function extractErrorInfo(root: HTMLElement): ParsedResponse {
  let errorMessage = "";

  // Method 1: Look for alert divs with Error! pattern
  const alertDivs = root.querySelectorAll('div.alert, div[class*="alert"]');

  for (const alertDiv of alertDivs) {
    const alertHtml = alertDiv.innerHTML || "";

    // Check if it contains Error! pattern
    if (
      alertHtml.includes("Error!") ||
      alertHtml.includes("error") ||
      alertHtml.includes("ত্রুটি")
    ) {
      const spans = alertDiv.querySelectorAll("span");
      const errorParts: string[] = [];

      for (const span of spans) {
        const spanText = span.innerText.trim();
        if (
          spanText &&
          !spanText.includes("Error!") &&
          !spanText.includes("×")
        ) {
          errorParts.push(spanText);
        }
      }

      if (errorParts.length > 0) {
        errorMessage = errorParts.join(". ").trim();
        break;
      }

      // Fallback: get all text from alert div, clean it up
      if (!errorMessage) {
        errorMessage = alertDiv.innerText
          .replace(/×/g, "")
          .replace(/Error!/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  }

  // Method 2: Look for specific error patterns in the HTML
  if (!errorMessage) {
    // Pattern: <strong>Error!</strong> followed by spans
    const strongTags = root.querySelectorAll("strong");
    for (const strong of strongTags) {
      if (strong.innerText.includes("Error!")) {
        const parentElement = strong.parentNode;
        if (parentElement) {
          const spans = parentElement.querySelectorAll("span");
          const messages: string[] = [];

          for (const span of spans) {
            const text = span.innerText.trim();
            if (text && text !== "Error!" && text !== "×") {
              messages.push(text);
            }
          }

          if (messages.length > 0) {
            errorMessage = messages.join(". ");
            break;
          }
        }
      }
    }
  }

  // Method 3: Look for validation errors or form errors
  if (!errorMessage) {
    const validationErrors = root.querySelectorAll(
      ".validation-error, .field-error, .form-error, .error-message",
    );
    if (validationErrors.length > 0) {
      const errors: string[] = [];
      for (const error of validationErrors) {
        const text = error.innerText.trim();
        if (text) {
          errors.push(text);
        }
      }
      errorMessage = errors.join(". ");
    }
  }

  // Method 4: Check if the response indicates a failed submission
  if (!errorMessage) {
    const bodyText = root.querySelector("body")?.innerText || "";
    if (
      bodyText.includes("submission failed") ||
      bodyText.includes("সমস্যা হয়েছে") ||
      bodyText.includes("ব্যর্থ হয়েছে") ||
      bodyText.includes("ত্রুটি")
    ) {
      errorMessage =
        "আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
    }
  }

  return {
    isSuccess: false,
    errorMessage: errorMessage || "অজানা ত্রুটি ঘটেছে",
  };
}

function extractAdditionalInfo(
  root: HTMLElement,
): ParsedResponse["additionalInfo"] {
  const info: ParsedResponse["additionalInfo"] = {};

  // Extract application type - green spans containing application type info
  const greenSpans = root.querySelectorAll('span[style*="color:green"]');
  for (const span of greenSpans) {
    const parentText =
      span.parentNode?.innerText || span.parentNode?.innerHTML || "";
    if (
      parentText.includes("আবেদনের প্রকৃতি") ||
      parentText.includes("প্রকার")
    ) {
      info.applicationType = span.innerText.trim();
      break;
    }
  }

  // Extract office name
  for (const span of greenSpans) {
    const parentText =
      span.parentNode?.innerText || span.parentNode?.innerHTML || "";
    if (parentText.includes("কার্যালয়ের নাম") || parentText.includes("অফিস")) {
      info.officeName = span.innerText.trim();
      break;
    }
  }

  // Extract phone number
  for (const span of greenSpans) {
    const parentText =
      span.parentNode?.innerText || span.parentNode?.innerHTML || "";
    if (parentText.includes("মোবাইল নম্বর") || parentText.includes("ফোন")) {
      info.phoneNumber = span.innerText.trim();
      break;
    }
  }

  // Extract submission deadline - red spans containing deadline info
  const redSpans = root.querySelectorAll('span[style*="color:red"]');
  for (const span of redSpans) {
    const parentText =
      span.parentNode?.innerText || span.parentNode?.innerHTML || "";
    if (
      parentText.includes("তারিখের মধ্যে") ||
      parentText.includes("deadline")
    ) {
      info.submissionDeadline = span.innerText.trim();
      break;
    }
  }

  return Object.keys(info).length > 0 ? info : undefined;
}

// Fallback method using regex patterns if DOM parsing fails
function extractUsingRegex(html: string): ParsedResponse {
  // Extract application ID using regex
  const appIdMatch = html.match(
    /আবেদনপত্র নম্বর\s*:\s*<span[^>]*>([^<]+)<\/span>/,
  );
  const applicationId = appIdMatch ? appIdMatch[1].trim() : "";

  if (applicationId) {
    // Extract print link using regex
    const printLinkMatch = html.match(/<a[^>]*href="([^"]*print[^"]*)"[^>]*>/i);
    let printLink = printLinkMatch ? printLinkMatch[1] : "";

    if (printLink && !printLink.startsWith("http")) {
      printLink = printLink.startsWith("/")
        ? `https://bdris.gov.bd${printLink}`
        : `https://bdris.gov.bd/${printLink}`;
    }

    return {
      isSuccess: true,
      applicationId,
      printLink: printLink || undefined,
    };
  }

  // Check for error messages using regex
  let errorMessage = "";

  // Method 1: Extract spans after Error!
  const errorMatch = html.match(
    /<div[^>]*class="[^"]*alert[^"]*"[^>]*>.*?<strong>\s*Error!?<\/strong>[\s\S]*?<span[^>]*>(.*?)<\/span>/i,
  );
  if (errorMatch && errorMatch[1]) {
    errorMessage = errorMatch[1].trim();
  } else {
    // Method 2: Extract all spans in alert divs
    // @ts-ignore
    const spanRegex =
      /<div[^>]*class="[^"]*alert[^"]*"[^>]*>.*?((<span[^>]*>.*?<\/span>)+).*?<\/div>/is;
    const spanMatch = html.match(spanRegex);
    if (spanMatch && spanMatch[1]) {
      // @ts-ignore
      const innerSpans = spanMatch[1].match(/<span[^>]*>(.*?)<\/span>/gis);
      if (innerSpans) {
        const allSpans = innerSpans.map((s: string) =>
          s.replace(/<[^>]+>/g, "").trim(),
        );
        errorMessage = allSpans
          .filter((s) => s && s !== "Error!" && s !== "×")
          .join(" ")
          .trim();
      }
    }
  }

  return {
    isSuccess: false,
    errorMessage: errorMessage || "অজানা ত্রুটি ঘটেছে",
  };
}
