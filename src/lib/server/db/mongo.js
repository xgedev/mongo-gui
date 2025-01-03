import * as env from "$env/static/private";
import mongoose from "mongoose";

let databases = JSON.parse(env.DATABASES || "[]");
let databaseInstances = [];

/**
 * @param {Number} databaseIndex 
 * @returns {Promise<mongoose.Mongoose>} 
 */
export async function connect(databaseIndex = 0) {

 let database = databases[databaseIndex];

 if (!database) return;

 let instance = databaseInstances[databaseIndex];

 if (!instance) {
  databaseInstances[databaseIndex] = new mongoose.Mongoose();
  instance = databaseInstances[databaseIndex];
 }

 if (instance.connection.readyState === 1) return instance;

 await instance.connect(`mongodb://${database.username}:${encodeURIComponent(database.password)}@${database.host}/${database.db}${database.addToConnStr || ""}`, {
  maxPoolSize: 10
 });

 console.log("Connected to database", database.db);

 return instance;

}

export default {
 connect
};