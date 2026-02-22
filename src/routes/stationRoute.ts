import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  createStation,
  getMyStations,
  getStation,
  updateStation,
  deleteStation,
  addPort,
} from "../controllers/stationController.js";
const Router = express.Router();

Router.post(
  "/",
  protect,
  restrictTo("operator", "admin") as any,
  createStation,
);

Router.get(
  "/my-stations",
  protect,
  restrictTo("operator", "admin") as any,
  getMyStations,
);

Router.route("/:id")
  .get(getStation)
  .patch(protect, restrictTo("operator", "admin") as any, updateStation)
  .delete(protect, restrictTo("operator", "admin") as any, deleteStation);

Router.post(
  "/:id/ports",
  protect,
  restrictTo("operator", "admin") as any,
  addPort,
);

export { Router as stationRouter };
