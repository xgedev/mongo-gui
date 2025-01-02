import { error, text } from "@sveltejs/kit"

export async function GET(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 return text(event.locals.user.username);
}