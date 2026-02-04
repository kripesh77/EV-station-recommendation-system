import { Schema, model } from "mongoose";
import type { Port, IStation } from "../types/types.js";

export const portSchema = new Schema<Port>(
  {
    connectorType: {
      type: String,
      enum: {
        values: ["AC_SLOW", "Type2", "CCS", "CHAdeMO"],
        message:
          "Connector type must be either AC_SLOW, Type2, CCS, or CHAdeMO",
      },
    },
    vehicleType: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: ["bike", "car"],
        message: "Vehicle type must be either bike or car",
      },
    },
    powerKW: {
      type: Number,
      required: [true, "Power (kW) is required"],
      min: [0.5, "Power must be at least 0.5 kW"],
      max: [350, "Power cannot exceed 350 kW"],
    },
    total: {
      type: Number,
      required: [true, "Total ports count is required"],
      min: [1, "Must have at least 1 port"],
    },
    pricePerKWh: {
      type: Number,
      required: [true, "Price per kWh is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false },
);

const stationSchema = new Schema<IStation>(
  {
    name: {
      type: String,
      required: [true, "Station name is required"],
      trim: true,
      maxlength: [100, "Station name is too long"],
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      required: [true, "Operator Id is required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // for now, only accepting Point as location type
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
        validate: {
          // coords = [lng, lat] in point 2d
          // lng ranges between -180 to 180
          // lat ranges between -90 to 90
          validator: function (coordinates: number[]) {
            return (
              coordinates.length === 2 &&
              coordinates[0]! >= -180 &&
              coordinates[0]! <= 180 &&
              coordinates[1]! >= -90 &&
              coordinates[1]! <= 90
            );
          },
          message:
            "Invalid coordinates. Coordinates should be in the format: [lng, lat]",
        },
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    ports: {
      type: [portSchema],
      required: [true, "At least one port is required"],
      validate: {
        validator: function (ports: Port[]) {
          return ports.length > 0;
        },
        message: "Station must have at least one port",
      },
    },
    operatingHours: {
      type: String,
      default: "24/7",
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either active or inactive",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Station = model("Station", stationSchema);

export default Station;
