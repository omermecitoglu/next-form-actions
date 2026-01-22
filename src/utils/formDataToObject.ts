export function formDataToObject(formData: FormData) {
  const result: Record<string, string | File | (string | File)[]> = {};
  for (const [key, value] of formData.entries()) {
    if (key in result) {
      const existing = result[key];

      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}
