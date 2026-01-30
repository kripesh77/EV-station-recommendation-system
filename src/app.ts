import express, { type Request, type Response } from "express";
import { globalErrorHandler } from "./controllers/errorController.js";
const app = express();

//handling undefined routes
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ status: "error", message: `${req.originalUrl} is not defined` });
});

//global error handler
app.use(globalErrorHandler);

export { app };
