import { redirect } from "@sveltejs/kit";

export function load(event) {
 event.cookies.delete("jwt", { path: "/" });
 return redirect(307, `/api/v1/logout/i?redirect=${event.url.searchParams.get("redirect") || encodeURIComponent("/")}`);
}