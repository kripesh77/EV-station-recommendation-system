import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  createStation,
  getMyStations,
  getStation,
} from "../controllers/stationController.js";
const Router = express.Router();

Router.post(
  "/",
  protect,
  restrictTo("operator", "admin") as any,
  createStation,
);

Router.get("/:id", getStation);

Router.get(
  "/my-stations",
  protect,
  restrictTo("operator", "admin") as any,
  getMyStations,
);

export { Router as stationRouter };
