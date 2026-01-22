export function displayMessage(messageType: "error" | "warning" | "success" | (string & {}), message: string): never {
  if (messageType === "error" || messageType === "warning" || messageType === "success") {
    throw { isDisplayMessage: true, messageType: `[${messageType}]`, message };
  }
  throw { isDisplayMessage: true, messageType, message };
}
