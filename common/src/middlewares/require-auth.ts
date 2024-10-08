import { Request, Response, NextFunction } from "express";

// constants
import { Role } from "../constants/enum-role";

// errors
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireAuth =
  (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    if (req.currentUser.role === Role.superuser) {
      return next();
    }

    if (!roles.includes(req.currentUser.role)) {
      throw new NotAuthorizedError();
    }

    next();
  };
