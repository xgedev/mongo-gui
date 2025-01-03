import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";
import { connect } from "$lib/server/db/mongo.js";

let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export async function PATCH(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 let databaseName = event.params.databaseName;
 let user = users.find(user => user.username === event.locals.user.username);
 let foundUserDB = user.databases.find(db => db.database === databaseName);
 if (!foundUserDB) return error(401, "Unauthorized");
 let { collection, _id, query } = await event.request.json();
 let hasCollectionAccess = getUserCollectionAccess(userDBConfig, collection);
 if (!hasCollectionAccess) return error(401, "Unauthorized");
 let db = await connect(databases.findIndex(db => db.db === databaseName));
 try {
  let result = await db.connection.collection(collection).updateOne({ _id }, query);
  return json(result);
 } catch (err) {
  return error(500, err.message);
 }
}