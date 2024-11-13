import express from "express";
import { prisma } from "../utils/prisma.util.js";

const userRouter = express.Router();

userRouter.post('/sign-in');

export { userRouter };