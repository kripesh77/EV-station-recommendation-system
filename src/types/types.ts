import type { Types } from "mongoose";

export type VehicleType = "bike" | "car";

export type ConnectorType = "AC_SLOW" | "Type2" | "CCS" | "CHAdeMO";

export type StationStatusType = "active" | "inactive";

export type UserRole = "user" | "operator" | "admin";

export interface Port {
  connectorType: ConnectorType;
  vehicleType: VehicleType;
  powerKW: number;
  occupied: number;
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

export interface IStationStatus {
  _id?: string;
  stationId: Types.ObjectId;
  portStatus: PortStatus[];
}

export interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  passwordConfirm: string | undefined;
  role: UserRole;
  // Operator-specific fields
  company?: string;
  phone?: string;
  // User-specific fields
  vehicleProfiles?: VehicleProfile[] | undefined;
  favoriteStations?: Types.ObjectId[] | undefined;
  // Common fields
  isActive: boolean;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  isOperator(): boolean;
  isAdmin(): boolean;
  isRegularUser(): boolean;
}

export interface VehicleProfile {
  _id?: string;
  vehicleType: VehicleType;
  batteryCapacity_kWh: number;
  efficiency_kWh_per_km: number;
  batteryPercent: number;
  compatibleConnectors: ConnectorType[];
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface IStation {
  _id: Types.ObjectId;
  name: string;
  operatorId: Types.ObjectId;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  ports: Port[];
  portStatus: PortStatus[];
  operatingHours: string;
  status: StationStatusType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Port {
  connectorType: ConnectorType;
  vehicleType: VehicleType;
  powerKW: number;
  total: number;
  pricePerKWh: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
