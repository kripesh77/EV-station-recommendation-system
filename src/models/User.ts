import { Schema, model, Types } from "mongoose";
import validator from "validator";
import type { VehicleProfile } from "./model.types.js";

const vehicleProfileSchema = new Schema(
  {
    vehicleType: {
      type: String,
      enum: ["bike", "car"],
      required: true,
    },
    batteryCapacity_kWh: {
      type: Number,
      required: true,
      min: 0.5,
      max: 200,
    },
    efficiency_kWh_per_km: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1,
    },
    batteryPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    compatibleConnectors: {
      type: [String],
      enum: ["AC_SLOW", "Type2", "CCS", "CHAdeMO"],
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Operator name is required"],
      trim: true,
      minlength: [3, "name must be atleast 3 char long"],
      maxlength: [100, "name is too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password should be atleast 8 char long"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (val: String) {
          return this.password === val;
        },
        message: "Password do not match",
      },
    },
    // company and phone are operator specific fields
    company: {
      type: String,
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    phone: {
      type: String,
      trim: true,
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number",
      ],
    },
    // user-specific fields
    vehicleProfiles: {
      type: [vehicleProfileSchema],
      default: [],
      validate: {
        validator: function (profiles: VehicleProfile[]) {
          return profiles.length <= 5; // Max 5 vehicle profiles per user
        },
        message: "Maximum 5 vehicle profiles allowed",
      },
    },
    favoriteStations: {
      type: [{ type: Schema.Types.ObjectId, ref: "Station" }],
      default: [],
      validate: {
        validator: function (stations: Types.ObjectId[]) {
          return stations.length <= 20; // Max 20 favorite stations are allowed in database
        },
        message: "Maximum 20 favorite stations are allowed",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
  },
  {
    timestamps: true, // automatically maintains createdAt and updatedAt field
    toJSON: {
      transform: function (_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const User = model("Operator", userSchema);

export default User;
