import { redirect } from "@sveltejs/kit";
import { getSafeRedirect } from "$lib/redirect";

export function load(event) {
 event.cookies.delete("jwt", { path: "/" });
 const destination = getSafeRedirect(event.url.searchParams.get("redirect"), event.url.origin);
 return redirect(307, `/api/v1/logout/i?redirect=${encodeURIComponent(destination)}`);
}