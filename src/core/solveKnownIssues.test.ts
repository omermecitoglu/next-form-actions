import { describe, expect, it } from "vitest";
import z from "zod";
import { solveKnownIssues } from "./solveKnownIssues";

describe("solveKnownIssues", () => {
  it("should convert strings to numbers", () => {
    const schema = z.object({
      foo: z.string(),
      baz: z.number(),
    });
    const validation = solveKnownIssues(schema, { foo: "bar", baz: "2026" });
    expect(validation.success).toBe(true);
    expect(validation.data).toEqual({ foo: "bar", baz: 2026 });
  });

  it("should convert strings to booleans", () => {
    const schema = z.object({
      yes: z.boolean(),
      no: z.boolean(),
    });
    const validation = solveKnownIssues(schema, { yes: "true", no: "false" });
    expect(validation.success).toBe(true);
    expect(validation.data).toEqual({ yes: true, no: false });
  });

  it("should fail to convert fake boolean values", () => {
    const schema = z.object({
      foo: z.boolean(),
      bar: z.boolean(),
    });
    const validation = solveKnownIssues(schema, { foo: "yes", bar: "on" });
    expect(validation.success).toBe(false);
  });

  it("should ignore errors that are not invalid_type (e.g. min length)", () => {
    const schema = z.object({ foo: z.string().min(5) });
    const result = solveKnownIssues(schema, { foo: "abc" }); // Too short

    // Should remain an error, code shouldn't try to "fix" it
    expect(result.success).toBe(false);
  });

  it("should ignore invalid_type if it is not expecting a number", () => {
    const schema = z.object({ isAdmin: z.boolean() });
    const result = solveKnownIssues(schema, { isAdmin: "yes" });

    // Should remain an error, "yes" cannot be parseFloat-ed safely
    expect(result.success).toBe(false);
  });
});
