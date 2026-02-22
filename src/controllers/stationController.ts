import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import catchAsyncError from "../utils/catchAsyncError.js";
import type { IStation, Port } from "../types/types.js";
import { AppError } from "../utils/appError.js";
import stationService from "../services/stationService.js";
import Station from "../models/Station.js";
import mongoose from "mongoose";

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
      operatorId: new Types.ObjectId(),
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

export const updateStation = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const id = req.params.id;
    // only allowing updation of name, location and address field from this endpoint
    const { name, location, address } = req.body as Pick<
      IStation,
      "name" | "location" | "address"
    >;

    if (!id) return next(new AppError("id of the station is required", 400));

    const { station: existingStation, isOwner } =
      await stationService.checkStationOwnership(
        new Types.ObjectId(id as string),
        new Types.ObjectId(req.user._id),
      );

    if (!existingStation) {
      return next(new AppError("Station not found", 404));
    }

    // Also throwing an error if operator is not the owner or not an admin
    if (!isOwner && req.user.role !== "admin") {
      return next(
        new AppError(
          "You don't have enough permission to access this resource",
          403,
        ),
      );
    }

    const station = await Station.findByIdAndUpdate(id, {
      name,
      location,
      address,
    });

    res.status(200).json({
      status: "success",
      data: {
        station,
      },
    });
  },
);

export const deleteStation = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const id = req.params.id as string;

    if (!id) {
      return next(new AppError("Please provide the station id", 400));
    }

    const { station: existingStation, isOwner } =
      await stationService.checkStationOwnership(
        id,
        new Types.ObjectId(req.user._id),
      );

    if (!existingStation) {
      return next(
        new AppError(
          "You don't have enough permission to delete this station",
          403,
        ),
      );
    }

    await stationService.deleteStation(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export const addPort = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const id = req.params.id as string;
    const port = req.body as Port;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        status: "error",
        message: "Station ID is required",
      });
      return;
    }

    // checking whether the operator is the owner of the station or not
    const { station: existingStation, isOwner } =
      await stationService.checkStationOwnership(
        new Types.ObjectId(id),
        new Types.ObjectId(req.user._id),
      );

    // throwing error if no there's no station
    if (!existingStation) {
      return next(new AppError("Station not found", 404));
    }

    // Also throwing an error if operator is not the owner or not an admin
    if (!isOwner && req.user.role !== "admin") {
      return next(
        new AppError(
          "You don't have enough permission to access this resource",
          403,
        ),
      );
    }

    // throwing error if required port information is not provided
    // such as connectorType, vehicleType, powerKW, total (count of that specific port), pricePerKWh
    if (
      !port.connectorType ||
      !port.vehicleType ||
      !port.powerKW ||
      !port.total ||
      port.pricePerKWh === undefined
    ) {
      return next(
        new AppError(
          "Missing required port fields: connectorType, vehicleType, powerKW, total, pricePerKWh",
          400,
        ),
      );
    }

    // finally adding the port
    const station = await stationService.addPort(new Types.ObjectId(id), port);
  },
);
