import { redirect } from "@sveltejs/kit";

export function GET(event) {
 event.locals.user = null;
 return redirect(307, `/login?redirect=${event.url.searchParams.get("redirect") || encodeURIComponent("/")}`);
}