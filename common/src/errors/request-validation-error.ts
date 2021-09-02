import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidatonError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    Object.setPrototypeOf(this, RequestValidatonError.prototype);
  }

  serializeErrors() {
    return this.errors.map(({ msg, param }) => ({
      message: msg,
      field: param,
    }));
  }
}
