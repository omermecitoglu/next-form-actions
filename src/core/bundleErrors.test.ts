import { describe, expect, it } from "vitest";
import { bundleErrors } from "./bundleErrors";
import type { $ZodIssue } from "zod/v4/core";

describe("bundleErrors", () => {
  it("should return the customErrorCode from params when issue code is 'custom'", () => {
    const issues: $ZodIssue[] = [
      {
        code: "custom",
        path: ["username"],
        message: "Some fallback message",
        params: {
          customErrorCode: "USERNAME_TAKEN",
        },
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      username: "USERNAME_TAKEN",
    });
  });

  it("should fall back to the issue message when customErrorCode is missing in a custom issue", () => {
    const issues: $ZodIssue[] = [
      {
        code: "custom",
        path: ["password"],
        message: "weak_password",
        params: {
          someOtherParam: 123,
        },
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      password: "WEAK_PASSWORD",
    });
  });

  it("should return a formatted string for 'invalid_format' issues", () => {
    const issues: $ZodIssue[] = [
      {
        code: "invalid_format",
        path: ["website"],
        format: "url",
        message: "Invalid url",
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      website: "INVALID_URL",
    });
  });

  it("should return 'REQUIRED' when an invalid_type issue indicates a missing value", () => {
    const issues: $ZodIssue[] = [
      {
        code: "invalid_type",
        path: ["email"],
        expected: "string",
        message: "expected string, received undefined",
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      email: "REQUIRED",
    });
  });

  it("should return 'INVALID_TYPE' for other type mismatches", () => {
    const issues: $ZodIssue[] = [
      {
        code: "invalid_type",
        path: ["age"],
        expected: "number",
        message: "Expected number, received string",
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      age: "INVALID_TYPE",
    });
  });

  it("should return the issue code directly for 'too_small' and 'too_big'", () => {
    const issues: $ZodIssue[] = [
      {
        code: "too_small",
        path: ["password"],
        message: "Too short",
        input: "string",
        origin: "string",
        minimum: 8,
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      password: "TOO_SMALL",
    });
  });

  it("should bundle multiple issues into a single record object", () => {
    const issues: $ZodIssue[] = [
      {
        code: "invalid_type",
        path: ["email"],
        expected: "string",
        message: "expected string, received undefined",
      },
      {
        code: "too_small",
        path: ["password"],
        message: "Too short",
        input: "string",
        origin: "string",
        minimum: 8,
      },
      {
        code: "invalid_format",
        path: ["website"],
        format: "url",
        message: "Invalid url",
      },
    ];

    const result = bundleErrors(issues);

    expect(result).toEqual({
      email: "REQUIRED",
      password: "TOO_SMALL",
      website: "INVALID_URL",
    });
  });

  it("should return 'UNKNOWN_ERROR' for unhandled Zod issue codes", () => {
    const issues: $ZodIssue[] = [
      {
        // @ts-expect-error 'invalid_enum_value' is not in the switch statement
        code: "invalid_enum_value",
        path: ["role"],
        options: ["admin", "user"],
        received: "guest",
        message: "Invalid enum value",
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      role: "UNKNOWN_ERROR",
    });
  });

  it("should handle a 'custom' issue where params is undefined", () => {
    const issues: $ZodIssue[] = [
      {
        code: "custom",
        path: ["account"],
        message: "generic_custom_error",
        params: undefined,
      },
    ];

    const result = bundleErrors(issues);
    expect(result).toEqual({
      account: "GENERIC_CUSTOM_ERROR",
    });
  });
});
