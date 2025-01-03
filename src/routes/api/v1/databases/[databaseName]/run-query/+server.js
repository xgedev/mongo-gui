import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";
import { connect } from "$lib/server/db/mongo.js";

let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export async function POST(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 let databaseName = event.params.databaseName;
 let user = users.find(user => user.username === event.locals.user.username);
 let foundUserDB = user.databases.find(db => db.database === databaseName);
 if (!foundUserDB) return error(401, "Unauthorized");
 let { collection, query, projection, limit } = await event.request.json();
 if (foundUserDB.showCollections?.length && !foundUserDB.showCollections.includes(collection)) {
  return error(401, "Unauthorized");
 }
 if (foundUserDB.hideCollections.includes(collection)) {
  return error(401, "Unauthorized");
 }
 let db = await connect(databases.findIndex(db => db.db === databaseName));
 try {
  let result = await db.connection.collection(collection).find(query, projection).limit(limit);
  return json(await result.toArray());
 } catch (err) {
  return error(500, err.message);
 }
}