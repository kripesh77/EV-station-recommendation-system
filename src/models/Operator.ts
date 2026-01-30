import mongoose, { Schema, model } from "mongoose";
import validator from "validator";

const operatorSchema = new Schema({
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
  company: {
    type: String,
    trim: true,
    maxlength: [200, "Company name cannot exceed 200 characters"],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s-()]{10,20}$/, "Please provide a valid phone number"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: Date,
});

const Operator = model("Operator", operatorSchema);
