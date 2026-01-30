import type { Types } from "mongoose";

export type VehicleType = "bike" | "car";

export type ConnectorType = "AC_SLOW" | "Type2" | "CCS" | "CHAdeMO";

export type StationStatusType = "active" | "inactive";

export interface Port {
  connectorType: ConnectorType;
  vehicleType: VehicleType;
  powerKW: number;
  total: number;
  pricePerKWh: number;
}

export interface Station {
  _id?: string;
  name: string;
  operatorId?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  ports: Port[];
  operatingHours: string;
  status: StationStatusType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortStatus {
  connectorType: ConnectorType;
  occupied: number;
}
export interface StationStatus {
  _id?: string;
  stationId: Types.ObjectId;
  portStatus: PortStatus[];
  lastUpdated: Date;
}

export interface PortStatus {
  connectorType: ConnectorType;
  occupied: number;
}
