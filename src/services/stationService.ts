import { Types } from "mongoose";
import Station from "../models/Station.js";
import type { IStation, Port } from "../types/types.js";

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

  async checkStationOwnership(
    stationId: Types.ObjectId | string,
    operatorId: Types.ObjectId | string,
  ): Promise<{ station: typeof Station.prototype | null; isOwner: boolean }> {
    const station = await Station.findById(stationId);
    if (!station) {
      return { station: null, isOwner: false };
    }

    const isOwner = station.operatorId?.toString() === operatorId;
    return { station, isOwner };
  }

  async addPort(
    stationId: Types.ObjectId,
    port: Port,
  ): Promise<IStation | null> {
    const station = await Station.findById(stationId);
    if (!station) return null;

    station.ports.push({
      ...port,
      occupied: port.occupied ?? 0,
    });

    await station.save();
    return station;
  }

  async deleteStation(id: string) {
    return Station.findByIdAndDelete(id);
  }
}

export default new StationService();
