import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";
import { connect } from "$lib/server/db/mongo.js";
import { getUserDBConfig, getUserCollectionAccess, consumeLimit, handleWebhookMessages } from "$lib/server/utils";

let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export async function POST(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 let databaseName = event.params.databaseName;
 let userDBConfig = getUserDBConfig(event.locals.user.username, databaseName);
 if (!userDBConfig) return error(401, "Unauthorized");
 let { collection, query, projection, limit } = await event.request.json();
 let hasCollectionAccess = getUserCollectionAccess(userDBConfig, collection);
 if (!hasCollectionAccess) return error(401, "Unauthorized");
 let ok = consumeLimit({
  type: "read",
  username: event.locals.user.username,
  databaseName,
  count: limit,
 });
 if (!ok) return error(429, "This request exceeds your daily limit");
 let db = await connect(databases.findIndex(db => db.db === databaseName));
 try {
  let result = await db.connection.collection(collection).find(query, {
   projection,
  }).limit(limit);
  handleWebhookMessages({
   type: "read",
   username: event.locals.user.username,
   databaseName,
   collection,
   query
  });
  return json(await result.toArray());
 } catch (err) {
  return error(500, err.message);
 }
}