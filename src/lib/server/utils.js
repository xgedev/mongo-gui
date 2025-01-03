import * as env from "$env/static/private";
let users = JSON.parse(env.USERS || "[]");
let databases = JSON.parse(env.DATABASES || "[]");

export function getUserDBConfig(username, databaseName) {
 let user = users.find(user => user.username === username);
 let dbConfig = user.databases.find(db => db.database === databaseName);
 if (!dbConfig) return false;
 return dbConfig;
}

export function getUserCollectionAccess(userDBConfig, collection) {
 if (userDBConfig.showCollections?.length && !userDBConfig.showCollections.includes(collection)) {
  return false;
 }
 if (userDBConfig.hideCollections.includes(collection)) {
  return false;
 }
 return true;
}