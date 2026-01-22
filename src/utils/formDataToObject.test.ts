import { describe, expect, it } from "vitest";
import { formDataToObject } from "./formDataToObject";

describe("formDataToObject", () => {
  it("should generate a json object from a FormData", () => {
    const formData = new FormData();
    formData.append("foo", "bar");
    const output = formDataToObject(formData);
    expect(output).toStrictEqual({
      foo: "bar",
    });
  });

  it("should convert duplicated keys into arrays", () => {
    const formData = new FormData();
    formData.append("foo", "bar");
    formData.append("foo", "baz");
    formData.append("foo", "qux");
    const output = formDataToObject(formData);
    expect(output).toStrictEqual({
      foo: ["bar", "baz", "qux"],
    });
  });
});
