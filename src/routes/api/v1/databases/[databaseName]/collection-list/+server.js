import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";
import { connect } from "$lib/server/db/mongo.js";
import { getUserDBConfig } from "$lib/server/utils";

let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export async function GET(event) {
 if (!event.locals.user) return error(401, "Unauthorized");
 let databaseName = event.params.databaseName;
 let userDBConfig = getUserDBConfig(event.locals.user.username, databaseName);
 if (!userDBConfig) return error(401, "Unauthorized");
 if (userDBConfig.showCollections?.length) {
  return json(userDBConfig.showCollections.sort());
 }
 let db = await connect(databases.findIndex(db => db.db === databaseName));
 let collections = await db.connection.listCollections(); // [{ name, ... }]
 let collectionNames = collections.map(collection => collection.name);
 return json(collectionNames.filter(n => !userDBConfig.hideCollections.includes(n)).sort());
}