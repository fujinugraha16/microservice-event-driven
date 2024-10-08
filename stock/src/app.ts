import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

// routers
import { showStockRouter } from "./routes/show-stock";
import { listStockRouter } from "./routes/list-stock";
import { inOutStockRouter } from "./routes/in-out";
import { detailStockRouter } from "./routes/detail-stock";

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

app.use(showStockRouter);
app.use(listStockRouter);
app.use(inOutStockRouter);
app.use(detailStockRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

// catch errors
app.use(errorHandler);

export { app };
