import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import { createStation } from "../controllers/stationController.js";
const Router = express.Router();

Router.post(
  "/",
  protect,
  restrictTo("operator", "admin") as any,
  createStation,
);

export { Router as stationRouter };
