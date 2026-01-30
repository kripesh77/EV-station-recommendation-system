import { Schema, model } from "mongoose";
import type { PortStatus, StationStatus } from "./model.types.js";

const portStatusSchema = new Schema<PortStatus>({
  connectorType: {
    type: String,
    required: [true, "Connector type is required"],
    enum: {
      values: ["AC_SLOW", "Type2", "CCS", "CHAdeMO"],
      message: "Connector type must be either AC_SLOW, Type2, CCS, or CHAdeMO",
    },
  },
  occupied: {
    type: Number,
    required: [true, "Occupied count is required"],
    min: [0, "Occupied count cannot be negative"],
    default: 0,
  },
});

const stationStatusSchema = new Schema<StationStatus>(
  {
    stationId: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: [true, "Station Id is required"],
      unique: true,
    },
    portStatus: {
      type: [portStatusSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const StationStatus = model("StationStatus", stationStatusSchema);

export default StationStatus;
