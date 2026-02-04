import type { NextFunction, Request, Response } from "express";
import catchAsyncError from "../utils/catchAsyncError.js";
import type { IStation } from "../types/types.js";
import { AppError } from "../utils/appError.js";
import stationService from "../services/stationService.js";

export const createStation = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Authentication required to create a station",
      });
      return;
    }

    const stationData = req.body as Omit<
      IStation,
      "_id" | "createdAt" | "updatedAt"
    >;

    if (!stationData.name || !stationData.location || !stationData.ports) {
      return next(
        new AppError("name, location and ports fields are required", 400),
      );
    }

    const station = await stationService.createStation(
      {
        ...stationData,
        operatorId: req.user._id.toString(),
      },
      next,
    );

    res.status(201).json({
      status: "success",
      data: {
        station,
      },
    });
  },
);
