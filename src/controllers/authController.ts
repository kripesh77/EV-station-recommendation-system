import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import catchAsyncError from "../utils/catchAsyncError.js";
import type { JWTPayload, UserDocument, UserRole } from "../types/types.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

interface User {
  user?: { role?: UserRole };
}

type CustomReq = Request & User;

export const signup = catchAsyncError(
  async (req: CustomReq, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, role, company, phone } =
      req.body;

    // We have three different roles i.e, 'user', 'operator', 'admin'
    // so we've to validate gracefully

    // validating general fields i.e, name, email, password
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    // Another admin account can only be created through an existing admin account
    if (role === "admin" && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({
        status: "fail",
        message: "Admin accounts can only be created by existing admins",
      });
    }

    // validating fields of operator
    if (role === "operator" && !company) {
      return res.status(400).json({
        status: "fail",
        message: "Company name is required for operator registration",
      });
    }

    // Now, finally creating a user
    const user = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
      company: role === "operator" ? company : undefined,
      phone,
    });

    const token = (user as UserDocument).generateAuthToken();

    res.status(201).json({
      status: "success",
      data: {
        token,
        user,
      },
    });
  },
);

export const signin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: "fail",
        message: "Account is deactivated. Please contact support.",
      });
    }

    if (!(await user.comparePassword(password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();
    //@ts-ignore
    user.password = undefined;

    return res
      .status(200)
      .json({ status: "success", token, data: { user: user } });
  },
);

export const protect = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. getting the token
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You're not logged in! Please log in.", 401));
    }

    // 2. verifying the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError("JWT secret is not configured", 500));
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    // 3. checking user actually exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    if (!user.isActive) {
      return next(new AppError("User account is deactivated", 401));
    }

    // 4. checking if user changed password after JWT was issued
    if (decoded.iat && user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("Password is recently changed! Please login again.", 401),
      );
    }

    req.user = user;

    // 5. granting access to protected route
    next();
  },
);

interface AuthenticatedRequest extends Request {
  user: UserDocument;
}

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You're not authorized to access this resource", 403),
      );
    }
    next();
  };
};
