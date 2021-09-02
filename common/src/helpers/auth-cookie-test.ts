import { Types } from "mongoose";
import jwt from "jsonwebtoken";

// constants
import { Role } from "../constants/enum-role";

export const generateCookie = (role: Role = Role.superuser) => {
  // Fake Cookie for test
  // Build a JWT payload. {id, email}
  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjI1YzZjYzAyMGZiMDAyZTVmNzU3NiIsImVtYWlsIjoidGVzdDJAdGVzdC5jb20iLCJpYXQiOjE2Mjk2NDE4MzZ9.mPdFWLNNtFodUQYesfUtOD1z7Txt9ZBfHynl9kcm2cU
  const payload = {
    id: new Types.ObjectId().toHexString(),
    username: "test",
    role,
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object {jwt: MY_JWT
  const session = { jwt: token };

  // turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // take JSON and encoded it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};

export const extractCookie = (cookies: string[]) => {
  // take base64 from cookies
  const base64 = cookies[0].split("=")[1];

  // decoded base64 to string and take JSON
  const sessionJSON = Buffer.from(base64, "base64").toString("ascii");

  // parse JSON data
  const session = JSON.parse(sessionJSON);

  // extract payload
  const payload = jwt.verify(session.jwt, process.env.JWT_KEY!);

  return payload;
};
