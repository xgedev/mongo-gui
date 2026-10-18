export function getSafeRedirect(value, baseUrl) {
 if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
  return "/";
 }

 try {
  const url = new URL(value, baseUrl);
  return url.origin === new URL(baseUrl).origin ? value : "/";
 } catch {
  return "/";
 }
}
