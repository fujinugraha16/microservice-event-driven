import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

// routers
import { createArticleRouter } from "./routes/article/create-article";
import { updateArticleRouter } from "./routes/article/update-article";
import { deleteArticleRouter } from "./routes/article/delete-article";
import { showArticleRouter } from "./routes/article/show-article";
import { listArticlesRouter } from "./routes/article/list-articles";

// middlewares
import { errorHandler, currentUser } from "@fujingr/common";

// errors
import { NotFoundError } from "@fujingr/common";

const app = express();
app.set("trust proxy", true);

// # body parser
app.use(json());

// # cookie sessions
app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== "test",
  })
);

// authentication
app.use(currentUser);

app.use(createArticleRouter);
app.use(updateArticleRouter);
app.use(deleteArticleRouter);
app.use(showArticleRouter);
app.use(listArticlesRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

// catch errors
app.use(errorHandler);

export { app };
