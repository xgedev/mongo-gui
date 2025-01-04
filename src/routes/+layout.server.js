import * as env from "$env/static/private";

export function load() {
 return {
  brandingName: env.BRANDING_NAME || "MongoGUI",
 }
}