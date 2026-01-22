import { describe, expect, it } from "vitest";
import z from "zod";
import { defineFormAction } from "./defineFormAction";

describe("defineFormAction", () => {
  it("should parse the form data with zod schema", async () => {
    const serverAction = defineFormAction({
      schema: z.object({
        foo: z.string(),
      }),
      action: input => (async () => {
        return await Promise.resolve({ ...input });
      }),
    });

    const formData = new FormData();
    formData.append("foo", "bar");
    const output = await serverAction(null, formData);
    expect(output).toEqual({ foo: "bar" });
  });

  it("should make sure that all the middlewares did not throw any error", async () => {
    const authMiddleware = () => {
      const userId = 1 as number;
      if (userId === 2) {
        throw new Error("not logged in");
      }
    };
    const serverAction = defineFormAction({
      middlewares: [authMiddleware],
      schema: z.object({
        foo: z.string(),
      }),
      action: input => (async () => {
        return await Promise.resolve({ ...input });
      }),
    });

    const formData = new FormData();
    formData.append("foo", "bar");
    const output = await serverAction(null, formData);
    expect(output).toEqual({ foo: "bar" });
  });

  it("should convert parsing errors into human-readable error codes", async () => {
    const serverAction = defineFormAction({
      schema: z.object({
        foo: z.string(),
      }),
      action: input => (async () => {
        return await Promise.resolve({ ...input });
      }),
    });

    const formData = new FormData();
    // formData.append("foo", "bar");
    const output = await serverAction(null, formData);
    expect(output).toEqual({ foo: "REQUIRED" });
  });
});
