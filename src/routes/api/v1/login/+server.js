import { error, json } from "@sveltejs/kit"
import * as env from "$env/static/private";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

let users = JSON.parse(env.USERS || "[]");

export async function POST(event) {
 if (event.locals.user) return json({ token: true })
 let { username, password } = await event.request.json();
 let user = users.find(user => user.username === username);
 let passwordMatch = user && await bcrypt.compare(password, user.password);
 if (!passwordMatch) {
  return error(401, "Invalid username or password");
 }
 let jwtPayload = {
  username: user.username,
  iat: Math.floor(Date.now() / 1000),
 };
 let jwtToken = jwt.sign(jwtPayload, env.JWT_SECRET);
 event.cookies.set("jwt", jwtToken, {
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  secure: env.STATE !== "dev",
  ...(env.STATE === "dev" ? {} : {
   domain: `.${env.DOMAIN}`,
  }),
 });
 return json({ token: jwtToken });
}