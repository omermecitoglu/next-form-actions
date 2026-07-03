import type { ZodSafeParseResult, ZodType } from "zod";

export function solveKnownIssues<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  input: Record<string, unknown>,
): ZodSafeParseResult<T> {
  const validation = schema.safeParse(input);
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      if (issue.code === "invalid_type") {
        if (issue.expected === "number" && issue.message.includes("expected number, received string")) {
          const [location] = issue.path;
          return solveKnownIssues(schema, {
            ...input,
            [location]: parseFloat(input[location as string] as string),
          });
        }
        if (issue.expected === "boolean" && issue.message.includes("expected boolean, received string")) {
          const [location] = issue.path;
          const value = input[location as string] as string;
          if (value === "true" || value === "false") {
            return solveKnownIssues(schema, {
              ...input,
              [location]: value === "true",
            });
          }
        }
      }
    }
  }
  return validation;
}
