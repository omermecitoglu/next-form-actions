import { describe, expect, it } from "vitest";
import { displayMessage } from "./displayMessage";

describe("displayMessage", () => {
  it("should throw an object", () => {
    try {
      displayMessage("warning", "Unauthorized access");
    } catch (error) {
      expect(error).toEqual({
        isDisplayMessage: true,
        messageType: "warning",
        message: "Unauthorized access",
      });
    }
  });
});
