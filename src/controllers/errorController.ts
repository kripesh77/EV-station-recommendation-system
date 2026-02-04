import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";

interface CastError {
  path: string;
  value: string;
}

const handleCastErrorDB = (err: CastError): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

interface DuplicateKeyError {
  keyValue: {
    name?: string;
    email?: string;
  };
}

const handleDuplicateEntry = (err: DuplicateKeyError): AppError => {
  return new AppError(
    `${err.keyValue.name || `'${err.keyValue.email}'`} already exists`,
    400,
  );
};

interface ValidationErrorDetail {
  message: string;
}

interface ValidationError {
  errors: {
    [key: string]: ValidationErrorDetail;
  };
}

const handleValidationError = (err: ValidationError): AppError => {
  const errorMessage = Object.values(err.errors)
    .map((el) => el.message)
    .join(". ");
  return new AppError(`Invalid input data. ${errorMessage}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token, please login again!", 401);

const handleJWTTokenExpiredError = () =>
  new AppError("Token expired. Please relogin", 401);

const sendErrorDev = (err: AppError, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);

    return res
      .status(500)
      .json({ status: "error", message: "Something went very wrong!" });
  }
};

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error: AppError = err;

    if (error.name === "CastError") error = handleCastErrorDB(error as any);
    if ((error as any).code === 11000)
      error = handleDuplicateEntry(error as any);
    if (error.name === "ValidationError")
      error = handleValidationError(error as any);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError")
      error = handleJWTTokenExpiredError();

    sendErrorProd(error, res);
  }
};
