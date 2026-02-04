import express from "express";
import { protect, signin, signup } from "../controllers/authController.js";
import {
  changePassword,
  getMe,
  updateMe,
} from "../controllers/userController.js";
const Router = express.Router();

Router.post("/signup", signup);
Router.post("/signin", signin);

Router.get("/me", protect, getMe);
Router.patch("/me", protect, updateMe);
Router.patch("/password", protect, changePassword);

export { Router as userRouter };
