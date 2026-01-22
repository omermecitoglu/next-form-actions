import { describe, expect, it } from "vitest";
import { displayMessage } from "./displayMessage";

describe("displayMessage", () => {
  it("should ", () => {
    try {
      displayMessage("username", "USERNAME_TAKEN");
    } catch (error) {
      expect(error).toEqual({
        isDisplayMessage: true,
        messageType: "username",
        message: "USERNAME_TAKEN",
      });
    }
  });

  it('should wrap "error", "warning" and "success" message types with square brackets', () => {
    try {
      displayMessage("error", "UNAUTHORIZED_ACCESS");
    } catch (error) {
      expect(error).toEqual({
        isDisplayMessage: true,
        messageType: "[error]",
        message: "UNAUTHORIZED_ACCESS",
      });
    }
  });
});
