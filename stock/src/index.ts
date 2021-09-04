import mongoose from "mongoose";

// nats
import { natsWrapper } from "./nats-wrapper";

import { app } from "./app";

// events
import { ArticleCreatedListener } from "./events/listener/article-created-listener";
import { ArticleUpdatedListener } from "./events/listener/article-updated-listener";
import { ArticleDeletedListener } from "./events/listener/article-deleted-listener";

import { LotCreatedListener } from "./events/listener/lot-created-listener";
import { LotAddItemsListener } from "./events/listener/lot-add-items-listener";
import { LotDeletedListener } from "./events/listener/lot-deleted-listener";

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }

  try {
    // nats streamer
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed ...");
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    // events listener
    new ArticleCreatedListener(natsWrapper.client).listen();
    new ArticleUpdatedListener(natsWrapper.client).listen();
    new ArticleDeletedListener(natsWrapper.client).listen();

    new LotCreatedListener(natsWrapper.client).listen();
    new LotAddItemsListener(natsWrapper.client).listen();
    new LotDeletedListener(natsWrapper.client).listen();

    // mongoose
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb ...");
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000 ...");
  });
};

start();
