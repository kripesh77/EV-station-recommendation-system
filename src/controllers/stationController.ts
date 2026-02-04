import type { NextFunction, Request, Response } from "express";
import catchAsyncError from "../utils/catchAsyncError.js";
import type { IStation } from "../types/types.js";
import { AppError } from "../utils/appError.js";
import stationService from "../services/stationService.js";
import Station from "../models/Station.js";

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

    const station = await stationService.createStation({
      ...stationData,
      operatorId: req.user._id.toString(),
    });

    res.status(201).json({
      status: "success",
      data: {
        station,
      },
    });
  },
);

export const getMyStations = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const stations = await Station.find({
      operatorId: req.user._id.toString(),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      result: stations.length,
      data: {
        stations,
      },
    });
  },
);

export const getStation = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("station id is required", 400));
    }

    const station = await stationService.getStationById(id as string);

    if (!station) {
      return next(new AppError("Station doesn't exist", 404));
    }

    res.status(200).json({ status: "success", data: { station } });
  },
);
