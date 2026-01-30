import type { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

const catchAsyncError = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch((err) => next(err));
  };
};

export default catchAsyncError;
