export let queryLimitCache = new Map(/*
 username -> {
  databaseName: {
   // for each request made: filter out old timestamps older than 24 hours
   read: [], // array of timestamps of each query made
   write: [], // array of timestamps of each query made
  }
 }
*/);