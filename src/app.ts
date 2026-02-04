import express, { type Request, type Response } from "express";
import { globalErrorHandler } from "./controllers/errorController.js";
import { userRouter } from "./routes/userRoute.js";
import { stationRouter } from "./routes/stationRoute.js";
const app = express();

app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/stations", stationRouter);

//handling undefined routes
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ status: "error", message: `${req.originalUrl} is not defined` });
});

//global error handler
app.use(globalErrorHandler);

export { app };
