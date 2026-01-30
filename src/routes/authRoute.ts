import express from "express";
const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

authRouter.get("/me", authenticate, getMe);
authRouter.patch("/me", authenticate, updateMe);
authRouter.patch("/password", authenticate, changePassword);

export { authRouter };
