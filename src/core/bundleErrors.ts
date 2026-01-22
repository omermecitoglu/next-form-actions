import { type $ZodIssue } from "zod/v4/core";

/**
 * Maps a Zod issue to a string error code or message.
 * @param issue - The Zod issue object.
 * @returns The error code or message for the issue.
 */
function handleZodIssue(issue: $ZodIssue): string {
  switch (issue.code) {
    case "custom": {
      const params = issue.params ?? {};
      if ("customErrorCode" in params && typeof params.customErrorCode === "string") {
        return params.customErrorCode;
      }
      return issue.message;
    }
    case "invalid_format":
      return `invalid_${issue.format}`; // e.g., INVALID_EMAIL, INVALID_URL, INVALID_UUID
    case "invalid_type": {
      if ((/expected .+?, received undefined/).test(issue.message)) {
        return "required";
      }
      return issue.code;
    }
    case "too_small":
    case "too_big":
      return issue.code; // known errors
    default:
      return "unknown_error";
  }
}

/**
 * Bundles an array of Zod issues into a record mapping field locations to error codes/messages.
 * @param issues - Array of Zod issues.
 * @returns An object mapping field names to error codes/messages.
 */
export function bundleErrors(issues: $ZodIssue[]): Record<string, string> {
  return issues.reduce((bundle, issue) => {
    const [location] = issue.path;
    return {
      ...bundle,
      [location]: handleZodIssue(issue).toUpperCase(),
    };
  }, {} as Record<string, string>);
}
