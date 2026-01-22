export function displayMessage(messageType: "error" | "warning" | "success", message: string): never {
  throw { isDisplayMessage: true, messageType, message };
}
