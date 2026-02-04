import type { NextFunction, Request, Response } from "express";
import catchAsyncError from "../utils/catchAsyncError.js";
import { AppError } from "../utils/appError.js";
import User from "../models/User.js";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(200).json({ status: "success", data: { user: req.user } });
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "fail",
      message: "Not authenticated",
    });
    return;
  }

  // we only allow three fields updation through this route
  // name, phone, company(in case of operator)
  const { name, company, phone } = req.body;

  // we don't allow email or password changes through this endpoint
  const updateData: Record<string, string> = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;

  // Only operators are allowed to update company
  if (req.user.role === "operator" && company !== undefined) {
    updateData.company = company;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: false,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User Not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

export const changePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 402));
    }

    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: "fail",
        message:
          "Current password, new password and confirm password field are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    // Password will be hashed by pre-save hook
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.passwordChangedAt = new Date();
    await user.save();

    // generating new token
    const token = user.generateAuthToken();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
      data: { token },
    });
  },
);
