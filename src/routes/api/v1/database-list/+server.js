import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";

let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export async function GET(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 let user = users.find(user => user.username === event.locals.user.username);
 return json(user.databases.map(db => ({
  database: db.database,
  write: !!db.write,
  limits: db.limits,
 })));
}