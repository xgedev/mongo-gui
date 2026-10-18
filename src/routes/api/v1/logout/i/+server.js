import { redirect } from "@sveltejs/kit";
import { getSafeRedirect } from "$lib/redirect";

export function GET(event) {
 event.locals.user = null;
 const destination = getSafeRedirect(event.url.searchParams.get("redirect"), event.url.origin);
 return redirect(307, `/login?redirect=${encodeURIComponent(destination)}`);
}