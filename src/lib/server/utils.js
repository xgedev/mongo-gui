import * as env from "$env/static/private";
import { queryLimitCache } from "$lib/server/cache";
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

/**
 * Consumes a limit of [type] for [username] on [databaseName].
 * @param {Object} options
 * @param {String} options.type read|write 
 * @param {String} options.username 
 * @param {String} options.databaseName 
 * @returns {Boolean} Whether the request is allowed
 */
export function consumeLimit({ type = "read", username, databaseName, count = 1 }) {
 let user = users.find(user => user.username === username);
 let userDatabaseLimits = user.databases.find(db => db.database === databaseName)?.limits;
 if (!userDatabaseLimits?.[type]) return true;
 let userDBLimitCache = getUserDBLimitCache(); // { read: [timestamps], write: [timestamps] }
 let now = Date.now();
 userDBLimitCache[type] = userDBLimitCache[type].filter(timestamp => (now-timestamp) < 24*60*60*1000);
 if ((userDBLimitCache[type].length+count) > userDatabaseLimits[type]) {
  return false;
 }
 userDBLimitCache[type].push(...(new Array(count).fill().map(_ => now)));
 return true;
 function getUserDBLimitCache() {
  if (!queryLimitCache.has(username)) {
   queryLimitCache.set(username, {});
  }
  let userCache = queryLimitCache.get(username);
  if (!userCache[databaseName]) {
   userCache[databaseName] = {
    read: [],
    write: []
   };
  }
  return userCache[databaseName];
 }
}