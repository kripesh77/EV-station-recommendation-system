import { Schema, model, Model } from "mongoose";
import type {
  ConnectorType,
  PortStatus,
  IStationStatus,
} from "../types/types.js";

interface IStationStatusModel extends Model<IStationStatus> {
  initializeStationStatus(
    stationId: string,
    uniqueConnectorTypes: ConnectorType[],
  ): Promise<IStationStatus>;
}

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

const stationStatusSchema = new Schema<IStationStatus>(
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

stationStatusSchema.index({ stationId: -1 });

stationStatusSchema.pre(/^find/, function (this: any) {
  this.select({ __v: 0 });
});

stationStatusSchema.statics.initializeStationStatus = async function (
  stationId: string,
  connectorTypes: ConnectorType[],
) {
  const portStatus = connectorTypes.map((connectorType) => ({
    connectorType,
    occupied: 0,
  }));

  return this.findOneAndUpdate(
    { stationId },
    { stationId, portStatus },
    { upsert: true, new: true },
  );
};

const StationStatus = model<IStationStatus, IStationStatusModel>(
  "StationStatus",
  stationStatusSchema,
);

export default StationStatus;
