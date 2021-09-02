import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/test-ms");
    console.log("Connected to mongodb ...");
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000 ...");
  });
};

start();
