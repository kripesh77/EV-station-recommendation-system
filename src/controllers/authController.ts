import type { NextFunction, Request, Response } from "express";
import catchAsyncError from "../utils/catchAsyncError.js";

export const signup = catchAsyncError(
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req, res, next);
  },
);
