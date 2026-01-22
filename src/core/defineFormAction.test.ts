import { describe, expect, it } from "vitest";
import z from "zod";
import { defineFormAction } from "./defineFormAction";
import { displayMessage } from "./displayMessage";

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

  it("should handle display messages", async () => {
    const serverAction = defineFormAction({
      schema: z.object({
        foo: z.string(),
      }),
      action: input => (() => {
        if (input.foo !== "bar") {
          displayMessage("error", "UNKNOWN_ERROR");
        }
        displayMessage("success", "OK");
      }),
    });

    const formData = new FormData();
    formData.append("foo", "baz");
    const output = await serverAction(null, formData);
    expect(output).toEqual({ "[error]": "UNKNOWN_ERROR" });
  });

  it("should throw unknown errors", async () => {
    const serverAction = defineFormAction({
      schema: z.object({
        foo: z.string(),
      }),
      action: input => (() => {
        if (input.foo !== "bar") {
          throw new Error("Unknown error");
        }
        displayMessage("success", "OK");
      }),
    });

    const formData = new FormData();
    formData.append("foo", "baz");
    await expect(serverAction(null, formData)).rejects.toThrow("Unknown error");
  });
});
