import type { NextFunction } from "express";
import Station from "../models/Station.js";
import StationStatus from "../models/StationStatus.js";
import type { ConnectorType, IStation, Port } from "../types/types.js";
import { AppError } from "../utils/appError.js";

class StationService {
  async createStation(
    stationData: Omit<IStation, "_id" | "createdAt" | "updatedAt">,
    next: NextFunction,
  ) {
    const station = await new Station(stationData).save();

    if (!station) {
      return next(new AppError("Internal Server Error", 500));
    }

    // Until now, we've just created our station
    // But we also have to initialize the status of our station
    // we need { stationId, portStatus: [{connectorType: "uniqueConnectorType", occupied: num }]} for stationStatus
    // so we just initialize occupied with 0 for each uniqueConnectorType, for the first time.
    const connectorTypes = (station.ports as Port[]).map(
      (port: Port) => port.connectorType,
    );

    // Now deriving unique connector types
    const uniqueConnectorTypes = [
      ...new Set(connectorTypes),
    ] as ConnectorType[];

    // initializing stationStation using statics mongoose method
    // awaiting here initiates a StationStatus in database collection "stationStatus"
    await StationStatus.initializeStationStatus(
      station?._id as string,
      uniqueConnectorTypes,
    );

    return station;
  }

  getStationById(stationId: string) {
    return Station.findById(stationId);
  }

  getStationStatusById(stationId: string) {
    return StationStatus.findOne({ stationId });
  }
}

export default new StationService();
