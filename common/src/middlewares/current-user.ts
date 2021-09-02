import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// constants

import { UserPayload } from "../constants/user-payload";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt, "asdf") as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
};
