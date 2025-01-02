import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";

let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export async function GET(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 let databaseName = event.params.databaseName;
 let user = users.find(user => user.username === event.locals.user.username);
 let foundUserDB = user.databases.find(db => db.database === databaseName);
 if (!foundUserDB) return error(401, "Unauthorized");
 if (foundUserDB.showCollections?.length) {
  return json(foundUserDB.showCollections.sort());
 }
 // TODO: Get all collections
}