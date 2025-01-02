import { redirect } from "@sveltejs/kit";

export function load(event) {
 event.cookies.delete("jwt", { path: "/" });
 return redirect(307, event.url.searchParams.get("redirect") || "/login");
}