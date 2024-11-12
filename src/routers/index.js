import express from "express";
import { authRouter } from "./auth.router.js";
import { resumeRouter } from "./resumes.router.js";
import { userRouter } from "./users.router.js";
const router = express.Router();

router.use('/auth', authRouter);
router.use('/resumes', resumeRouter);
router.use('/users', userRouter);

export { router };