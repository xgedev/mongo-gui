import { error, json } from "@sveltejs/kit";
import * as env from "$env/static/private";
import { connect } from "$lib/server/db/mongo.js";
import { getUserDBConfig, getUserCollectionAccess } from "$lib/server/utils";

let databases = JSON.parse(env.DATABASES || "[]");

export async function POST(event) {
  if (!event.locals.user) return error(401, "Unauthorized");
  const databaseName = event.params.databaseName;
  const userDBConfig = getUserDBConfig(event.locals.user.username, databaseName);
  if (!userDBConfig) return error(401, "Unauthorized");
  const { collection } = await event.request.json();
  const hasAccess = getUserCollectionAccess(userDBConfig, collection);
  if (!hasAccess) return error(401, "Unauthorized");
  const db = await connect(databases.findIndex(db => db.db === databaseName));
  try {
    const total = await db.connection.collection(collection).countDocuments();
    return json({ total });
  } catch (err) {
    return error(500, err.message);
  }
}
