import jwt from "jsonwebtoken";
import * as env from "$env/static/private";

export async function handle({ event, resolve }) {
 
 const jwtToken = event.cookies.get("jwt");
 if (jwtToken) await handleJWT();
 return await resolve(event);
 
 async function handleJWT() {
  try {
   let userData = jwt.verify(jwtToken, env.JWT_SECRET);
   event.locals.user = userData;
  } catch (err) {
   console.log("err", err)
   // If token verification fails, clear the cookie
   event.cookies.delete("jwt", { path: "/" });
   event.locals.user = null;
  }
 }
}