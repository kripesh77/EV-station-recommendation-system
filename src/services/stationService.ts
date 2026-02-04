import type { NextFunction } from "express";
import Station from "../models/Station.js";
import type { ConnectorType, IStation, Port } from "../types/types.js";

class StationService {
  async createStation(
    stationData: Omit<IStation, "_id" | "createdAt" | "updatedAt">,
  ) {
    // Basically, creating station
    // creating new Station model instance
    const station = new Station({
      ...stationData,
      lastStatusUpdate: new Date(),
    });

    // saving the document in database
    await station.save();

    return station;
  }

  getStationById(stationId: string) {
    return Station.findById(stationId);
  }
}

export default new StationService();
